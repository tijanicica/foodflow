package com.iis.foodflow.enums;

import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    CUSTOMER,
    DRIVER,
    OPERATOR,
    MANAGER,
    ADMINISTRATOR,
    SUPPORT_ADMINISTRATOR;

    @Override
    public String getAuthority() {
        return "ROLE_" + this.name(); // Spring Security automatski dodaje "ROLE_" prefiks
    }
}