// backend/src/main/java/com/example/evcarbonmonitor/exception/ApiException.java
package com.example.evcarbonmonitor.exception;

public class ApiException extends RuntimeException {
    private int code;

    public ApiException(String message) {
        this(400, message);
    }

    public ApiException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
