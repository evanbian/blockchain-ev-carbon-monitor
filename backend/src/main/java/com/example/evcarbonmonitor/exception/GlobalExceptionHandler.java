// backend/src/main/java/com/example/evcarbonmonitor/exception/GlobalExceptionHandler.java
package com.example.evcarbonmonitor.exception;

import com.example.evcarbonmonitor.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ApiResponse<?> handleApiException(ApiException e) {
        logger.error("API异常: {}", e.getMessage());
        return ApiResponse.error(e.getCode(), e.getMessage());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<?> handleValidationExceptions(MethodArgumentNotValidException e) {
        Map<String, Object> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        logger.error("参数验证失败: {}", errors);
        return ApiResponse.error(400, "输入参数错误", errors);
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public ApiResponse<?> handleAllExceptions(Exception e) {
        logger.error("系统异常: ", e);
        return ApiResponse.error(500, "服务器内部错误");
    }
}
