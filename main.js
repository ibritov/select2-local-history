$(document).ready(function() {
    const initAutocomplete = (searchInputId, selectId) => {
        const searchInput = $(`#${searchInputId}`);
        const select = $(`#${selectId}`);
        const recentSearchesKey = `${searchInputId}_recentSearches`;
        const selectArrow = searchInput.siblings('.select-arrow');

        const getRecentSearches = () => {
            const searches = localStorage.getItem(recentSearchesKey);
            return searches ? JSON.parse(searches) : [];
        };

        const saveRecentSearch = (search) => {
            let searches = getRecentSearches();
            searches = searches.filter(item => item !== search);
            searches.unshift(search);
            if (searches.length > 3) searches.pop();
            localStorage.setItem(recentSearchesKey, JSON.stringify(searches));
        };

        const removeRecentSearch = (search) => {
            let searches = getRecentSearches();
            searches = searches.filter(item => item !== search);
            localStorage.setItem(recentSearchesKey, JSON.stringify(searches));
        };

        const getOptions = () => {
            return select.find('option').map(function() {
                return $(this).text();
            }).get();
        };

        const renderMenu = (container, items) => {
            container.empty();
            let currentCategory = "";
            $.each(items, function(index, item) {
                if (item.category !== currentCategory) {
                    container.append("<div class='ui-autocomplete-category'>" + item.categoryLabel + "</div>");
                    currentCategory = item.category;
                }
                const div = $("<div>").text(item.label).addClass('ui-menu-item-wrapper');
                if (item.category === "RECENT_SEARCHES") {
                    const removeIcon = $("<span class='remove-tag'>&times;</span>").click(function(event) {
                        event.stopPropagation();
                        removeRecentSearch(item.label);
                        searchInput.trigger("keyup");
                    });
                    div.addClass("recent-searches-tag").append(removeIcon);
                }
                container.append(div);
            });
        };

        searchInput.on('keyup focus', function() {
            const term = searchInput.val();
            const recentSearches = getRecentSearches();
            const items = getOptions();
            const matches = items.filter(item => item.toLowerCase().includes(term.toLowerCase())).slice(0, 5);

            const results = [
                ...recentSearches.map(search => ({ label: search, category: "RECENT_SEARCHES", categoryLabel: 'Búsquedas recientes'})),
                ...matches.map(search => ({ label: search, category: "MATCHES", categoryLabel: 'Coincidencias'})),
                ...items.map(search => ({ label: search, category: "ITEMS", categoryLabel: 'Todos los sistemas'}))
            ];

            renderMenu($(`#${searchInputId}_suggestions`), results);
            $(`#${searchInputId}_suggestions`).show();
            selectArrow.show();
        });

        searchInput.on('blur', function() {
            setTimeout(() => {
                $(`#${searchInputId}_suggestions`).hide();
                selectArrow.hide();
            }, 100);
        });

        $('body').on('click', `#${searchInputId}_suggestions .ui-menu-item-wrapper`, function() {
            const selectedItem = $(this).text();
            saveRecentSearch(selectedItem);
            searchInput.val(selectedItem);
            $(`#${searchInputId}_suggestions`).hide();
        });

        $('body').on('mouseenter', `#${searchInputId}_suggestions .ui-menu-item-wrapper`, function() {
            $(this).addClass('ui-state-focus');
        }).on('mouseleave', `#${searchInputId}_suggestions .ui-menu-item-wrapper`, function() {
            $(this).removeClass('ui-state-focus');
        });
    };

    // Create the suggestions container and append it to the body
    $('<div id="searchInput_suggestions" class="autocomplete-suggestions" style="display: none"></div>').appendTo('.search-input-div');
    $('<div id="anotherSearchInput_suggestions" class="autocomplete-suggestions" style="display: none"></div>').appendTo('body');

    initAutocomplete('searchInput', 'systemSelect');
    initAutocomplete('anotherSearchInput', 'anotherSelect');
});