// backend/src/main/java/com/example/evcarbonmonitor/dto/BatchImportResponse.java
package com.example.evcarbonmonitor.dto;

import java.util.List;

public class BatchImportResponse {
    private int total;
    private int success;
    private int failed;
    private List<FailureRecord> failures;
    private List<VehicleDTO> newVehicles;

    // 失败记录内部类
    public static class FailureRecord {
        private int line;
        private String vin;
        private String reason;

        // Constructors, Getters and Setters
        public FailureRecord() {
        }

        public FailureRecord(int line, String vin, String reason) {
            this.line = line;
            this.vin = vin;
            this.reason = reason;
        }

        public int getLine() {
            return line;
        }

        public void setLine(int line) {
            this.line = line;
        }

        public String getVin() {
            return vin;
        }

        public void setVin(String vin) {
            this.vin = vin;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    // Constructors, Getters and Setters
    public BatchImportResponse() {
    }

    public BatchImportResponse(int total, int success, int failed, List<FailureRecord> failures, List<VehicleDTO> newVehicles) {
        this.total = total;
        this.success = success;
        this.failed = failed;
        this.failures = failures;
        this.newVehicles = newVehicles;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getSuccess() {
        return success;
    }

    public void setSuccess(int success) {
        this.success = success;
    }

    public int getFailed() {
        return failed;
    }

    public void setFailed(int failed) {
        this.failed = failed;
    }

    public List<FailureRecord> getFailures() {
        return failures;
    }

    public void setFailures(List<FailureRecord> failures) {
        this.failures = failures;
    }

    public List<VehicleDTO> getNewVehicles() {
        return newVehicles;
    }

    public void setNewVehicles(List<VehicleDTO> newVehicles) {
        this.newVehicles = newVehicles;
    }
}
