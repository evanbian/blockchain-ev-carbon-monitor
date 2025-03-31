// backend/src/main/java/com/example/evcarbonmonitor/dto/ApiResponse.java
package com.example.evcarbonmonitor.dto;

import java.util.HashMap;
import java.util.Map;

public class ApiResponse<T> {
    private boolean success;
    private int code;
    private String message;
    private T data;
    private Map<String, Object> errors;

    // 成功响应
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, 200, "操作成功", data, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, 200, message, data, null);
    }

    // 失败响应
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(false, code, message, null, null);
    }

    public static <T> ApiResponse<T> error(int code, String message, Map<String, Object> errors) {
        return new ApiResponse<>(false, code, message, null, errors);
    }

    // 添加字段错误
    public ApiResponse<T> addFieldError(String field, String errorMessage) {
        if (errors == null) {
            errors = new HashMap<>();
        }
        errors.put(field, errorMessage);
        return this;
    }

    // 构造函数、getter和setter
    public ApiResponse() {
    }

    public ApiResponse(boolean success, int code, String message, T data, Map<String, Object> errors) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Map<String, Object> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, Object> errors) {
        this.errors = errors;
    }
}
