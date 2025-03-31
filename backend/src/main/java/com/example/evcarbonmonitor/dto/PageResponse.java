// backend/src/main/java/com/example/evcarbonmonitor/dto/PageResponse.java
package com.example.evcarbonmonitor.dto;

import java.util.List;

public class PageResponse<T> {
    private long total;
    private int page;
    private int size;
    private List<T> items;

    // Constructors, Getters and Setters
    public PageResponse() {
    }

    public PageResponse(long total, int page, int size, List<T> items) {
        this.total = total;
        this.page = page;
        this.size = size;
        this.items = items;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }
}
