// backend/src/main/java/com/example/evcarbonmonitor/dto/VehicleQueryParams.java
package com.example.evcarbonmonitor.dto;

public class VehicleQueryParams {
    private Integer page = 1;
    private Integer size = 20;
    private String status;
    private String sort;
    private String order = "asc";

    // Constructors, Getters and Setters
    public VehicleQueryParams() {
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }
}
