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

        searchInput.autocomplete({
            minLength: 0,
            source: function(request, response) {
                const recentSearches = getRecentSearches();
                const systems = getOptions();
                const matches = $.ui.autocomplete.filter(systems, request.term).slice(0, 5);

                response([
                    ...recentSearches.map(search => ({ label: search, category: "Búsquedas recientes" })),
                    ...matches.map(search => ({ label: search, category: "Coincidencias" })),
                    ...systems.map(search => ({ label: search, category: "Todos los sistemas" }))
                ]);
            },
            focus: function(event, ui) {
                searchInput.val(ui.item.label);
                return false;
            },
            select: function(event, ui) {
                saveRecentSearch(ui.item.label);
                searchInput.val(ui.item.label);
                return false;
            }
        }).autocomplete("instance")._renderItem = function(ul, item) {
            const li = $("<li>")
                .append("<div class='autocomplete-item ui-menu-item-wrapper'>" + item.label + "</div>");

            if (item.category === "Búsquedas recientes") {
                const removeIcon = $("<span class='remove-tag'>&times;</span>").click(function() {
                    removeRecentSearch(item.label);
                    searchInput.autocomplete("search", "");
                });
                li.find(".ui-menu-item-wrapper").addClass("recent-searches-tag").append(removeIcon);
            }

            return li.appendTo(ul);
        };

        searchInput.autocomplete("instance")._renderMenu = function(ul, items) {
            let currentCategory = "";
            $.each(items, function(index, item) {
                if (item.category !== currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                searchInput.autocomplete("instance")._renderItemData(ul, item);
            });
        };

        searchInput.on('focus', function() {
            $(this).autocomplete("search", "");
            selectArrow.show();
        });

        searchInput.on('blur', function() {
            setTimeout(() => {
                $('.autocomplete-suggestions').remove();
                selectArrow.hide(); 
            }, 100);
        });
    };

    initAutocomplete('searchInput', 'systemSelect');
    initAutocomplete('anotherSearchInput', 'anotherSelect');
});
