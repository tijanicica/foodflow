// Datoteka: src/main/java/com/iis/foodflow/enums/DriverStatus.java
package com.iis.foodflow.enums;

public enum DriverStatus {
    /**
     * Dostavljač je aktivan, ulogovan u aplikaciju i spreman da prima ponude za dostavu.
     * Ovo je jedini status u kojem mu algoritam može dodijeliti porudžbinu.
     */
    ONLINE,

    /**
     * Dostavljač nije ulogovan u aplikaciju ili je eksplicitno postavio svoj status
     * na nedostupan. Ne može primati nove porudžbine.
     */
    OFFLINE
}