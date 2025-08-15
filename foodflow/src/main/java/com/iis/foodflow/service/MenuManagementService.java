package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.CreateMenuItemRequestDTO;
import com.iis.foodflow.dto.request.CreateMenuRequestDTO;
import com.iis.foodflow.dto.request.UpdateMenuRequestDTO;
import com.iis.foodflow.dto.response.ManagerMenuDTO;
import com.iis.foodflow.dto.response.MenuItemDetailDTO;
import com.iis.foodflow.dto.response.MenuVersionDetailDTO;
import com.iis.foodflow.dto.response.RestaurantMenusDTO;
import com.iis.foodflow.model.restaurant.*;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuManagementService {

    private final MenuRepository menuRepository;
    private final MenuVersionRepository menuVersionRepository;
    private final ManagerRepository managerRepository;
    private final RestaurantRepository restaurantRepository;
    private final AllergenRepository allergenRepository;
    private final DietTypeRepository dietTypeRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemVersionRepository menuItemVersionRepository;

    @Transactional(readOnly = true)
    public List<RestaurantMenusDTO> getMenusGroupedByRestaurant(Manager manager) {
        List<MenuVersion> allVersions = menuVersionRepository.findAllByManagerWithDetails(manager);
        Map<Restaurant, List<MenuVersion>> groupedByRestaurant = allVersions.stream()
                .collect(Collectors.groupingBy(version -> version.getMenu().getRestaurant()));

        return groupedByRestaurant.entrySet().stream()
                .map(entry -> {
                    Restaurant restaurant = entry.getKey();
                    List<MenuVersion> versionsForRestaurant = entry.getValue();
                    List<ManagerMenuDTO> menuDTOs = versionsForRestaurant.stream()
                            .map(this::mapToManagerMenuDTO)
                            .sorted(Comparator.comparing(ManagerMenuDTO::isActive).reversed()
                                    .thenComparing(ManagerMenuDTO::getCreationDate, Comparator.nullsLast(Comparator.reverseOrder())))
                            .collect(Collectors.toList());
                    return new RestaurantMenusDTO(restaurant.getId(), restaurant.getName(), menuDTOs);
                })
                .sorted(Comparator.comparing(RestaurantMenusDTO::getRestaurantName))
                .collect(Collectors.toList());
    }

    private ManagerMenuDTO mapToManagerMenuDTO(MenuVersion menuVersion) {
        return ManagerMenuDTO.builder()
                .id(menuVersion.getId())
                .name(menuVersion.getMenu().getName())
                .creationDate(menuVersion.getCreationDate())
                .active(menuVersion.isActive())
                .build();
    }

    @Transactional
    public ManagerMenuDTO createMenu(CreateMenuRequestDTO request, Manager currentManager) {
        Restaurant managedRestaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (!managedRestaurant.getManager().getId().equals(currentManager.getId())) {
            throw new SecurityException("Manager is not authorized to add a menu to this restaurant.");
        }

        Menu newMenu = new Menu();
        newMenu.setName(request.getMenuName());
        newMenu.setRestaurant(managedRestaurant);

        // ===== DODATI OVAJ RED =====
        // Ovo osigurava da je dvosmerna veza kompletna i u memoriji.
        // Iako nije eksplicitno potrebno za čuvanje stranog ključa,
        // održava stanje objekata konzistentnim.
        // managedRestaurant.getMenus().add(newMenu); // Pretpostavljajući da se kolekcija zove 'menus'

        MenuVersion initialVersion = new MenuVersion();
        initialVersion.setMenu(newMenu);
        initialVersion.setVersionNumber(1);
        initialVersion.setCreationDate(LocalDateTime.now());
        initialVersion.setActive(false);

        if (request.getActivationDate() != null) {
            initialVersion.setDateFrom(request.getActivationDate().atStartOfDay());
        }

        newMenu.getVersions().add(initialVersion);
        Menu savedMenu = menuRepository.save(newMenu);
        return mapToManagerMenuDTO(savedMenu.getVersions().stream().findFirst().get());
    }

    @Transactional(readOnly = true)
    public MenuVersionDetailDTO getMenuVersionDetails(Long menuVersionId, Manager currentManager) {
        Manager manager = managerRepository.findByEmailWithRestaurants(currentManager.getEmail())
                .orElseThrow(() -> new IllegalStateException("Manager not found"));

        MenuVersion menuVersion = menuVersionRepository.findById(menuVersionId)
                .orElseThrow(() -> new RuntimeException("Menu version not found"));

        if (!menuVersion.getMenu().getRestaurant().getManager().getId().equals(manager.getId())) {
            throw new SecurityException("You are not authorized to edit this menu.");
        }

        List<MenuItemDetailDTO> itemDTOs = menuVersion.getMenuItemVersions().stream()
                .map(miv -> MenuItemDetailDTO.builder()
                        .id(miv.getId())
                        .name(miv.getMenuItem().getName())
                        .price(miv.getPrice())
                        .build())
                .collect(Collectors.toList());

        return MenuVersionDetailDTO.builder()
                .id(menuVersion.getId())
                .menuName(menuVersion.getMenu().getName())
                .items(itemDTOs)
                .build();
    }

    @Transactional
    public void deactivateMenuVersion(Long menuVersionId, Manager manager) {
        MenuVersion menuToDeactivate = menuVersionRepository.findById(menuVersionId)
                .orElseThrow(() -> new RuntimeException("Menu version not found"));

        if (!menuToDeactivate.getMenu().getRestaurant().getManager().getId().equals(manager.getId())) {
            throw new SecurityException("You are not authorized to modify this menu.");
        }

        if (!menuToDeactivate.isActive()) return;

        long totalActiveMenus = menuVersionRepository.countActiveByRestaurantId(
                menuToDeactivate.getMenu().getRestaurant().getId()
        );

        if (totalActiveMenus <= 1) {
            throw new IllegalStateException("Cannot deactivate the only active menu.");
        }

        menuToDeactivate.setActive(false);
        menuVersionRepository.save(menuToDeactivate);
    }

    @Transactional
    public void activateMenuVersion(Long menuVersionId, Manager manager) {
        MenuVersion versionToActivate = menuVersionRepository.findById(menuVersionId)
                .orElseThrow(() -> new RuntimeException("Menu version not found"));

        if (!versionToActivate.getMenu().getRestaurant().getManager().getId().equals(manager.getId())) {
            throw new SecurityException("You are not authorized to activate this menu.");
        }

        Restaurant restaurant = versionToActivate.getMenu().getRestaurant();
        Restaurant fullRestaurant = restaurantRepository.findByIdWithMenusAndVersions(restaurant.getId())
                .orElseThrow(() -> new IllegalStateException("Restaurant not found"));

        fullRestaurant.getMenus().forEach(menu -> {
            menu.getVersions().forEach(version -> {
                if (version.isActive()) {
                    version.setActive(false);
                    menuVersionRepository.save(version);
                }
            });
        });

        versionToActivate.setActive(true);
        menuVersionRepository.save(versionToActivate);
    }

    @Transactional
    public ManagerMenuDTO updateMenu(Long menuVersionId, UpdateMenuRequestDTO request, Manager manager) {
        MenuVersion menuVersion = menuVersionRepository.findById(menuVersionId)
                .orElseThrow(() -> new RuntimeException("Menu version not found"));

        if (!menuVersion.getMenu().getRestaurant().getManager().getId().equals(manager.getId())) {
            throw new SecurityException("You are not authorized to edit this menu.");
        }

        Menu menu = menuVersion.getMenu();
        menu.setName(request.getMenuName());
        menuRepository.save(menu);

        return mapToManagerMenuDTO(menuVersion);
    }

    @Transactional
    public void addItemToMenu(Long menuVersionId, CreateMenuItemRequestDTO request, Manager manager) {
        MenuVersion menuVersion = menuVersionRepository.findById(menuVersionId)
                .orElseThrow(() -> new RuntimeException("Menu version not found"));

        if (!menuVersion.getMenu().getRestaurant().getManager().getId().equals(manager.getId())) {
            throw new SecurityException("You are not authorized to add items to this menu.");
        }

        Set<Allergen> allergens = request.getAllergenIds() != null ? new HashSet<>(allergenRepository.findAllById(request.getAllergenIds())) : new HashSet<>();
        Set<DietType> dietTypes = request.getDietTypeIds() != null ? new HashSet<>(dietTypeRepository.findAllById(request.getDietTypeIds())) : new HashSet<>();

        MenuItem newItem = new MenuItem();
        newItem.setName(request.getName());
        newItem.setDescription(request.getDescription());
        newItem.setType(request.getType());
        newItem.setAllergens(allergens);
        newItem.setDietTypes(dietTypes);
        newItem.setImageUrl("/images/placeholder.jpg");

        MenuItem savedMenuItem = menuItemRepository.save(newItem);

        MenuItemVersion newMenuItemVersion = new MenuItemVersion();
        newMenuItemVersion.setMenuItem(savedMenuItem);
        newMenuItemVersion.setMenuVersion(menuVersion);
        newMenuItemVersion.setPrice(request.getPrice());
        newMenuItemVersion.setAvailable(true);

        if (!request.isAvailableAllDay()) {
            newMenuItemVersion.setTimeFrom(request.getTimeFrom());
            newMenuItemVersion.setTimeTo(request.getTimeTo());
        }

        menuItemVersionRepository.save(newMenuItemVersion);
    }
}