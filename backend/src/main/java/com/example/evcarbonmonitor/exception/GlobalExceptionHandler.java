// backend/src/main/java/com/example/evcarbonmonitor/exception/GlobalExceptionHandler.java
package com.example.evcarbonmonitor.exception;

import com.example.evcarbonmonitor.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ApiResponse<?> handleApiException(ApiException e) {
        log.error("API异常: {}", e.getMessage());
        return ApiResponse.error(e.getCode(), e.getMessage());
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        
        Map<String, String> stringErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            stringErrors.put(fieldName, errorMessage);
        });
        log.error("参数验证失败: {}", stringErrors);
        
        Map<String, Object> objectErrors = new HashMap<>();
        for (Map.Entry<String, String> entry : stringErrors.entrySet()) {
            objectErrors.put(entry.getKey(), entry.getValue());
        }
        
        ApiResponse<Object> apiResponse = ApiResponse.<Object>error(HttpStatus.BAD_REQUEST.value(), "输入参数错误", objectErrors);
        
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("code", HttpStatus.NOT_FOUND.value());
        body.put("message", ex.getMessage());
        body.put("data", null);

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
        if (ex instanceof ResourceNotFoundException || ex instanceof ApiException) {
            log.error("Specific exception {} reached generic handler!", ex.getClass().getSimpleName(), ex);
        } else {
            log.error("An unexpected error occurred: {}", ex.getMessage(), ex);
        }
       
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("code", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("message", "An internal server error occurred. Please try again later.");
        body.put("data", null);

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
