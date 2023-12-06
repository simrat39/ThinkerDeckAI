document.addEventListener('DOMContentLoaded', function() {
    // Assuming you have an endpoint '/categories' that returns a list of categories
    fetch('/categories')
        .then(response => response.json())
        .then(categories => {
            const list = document.getElementById('categories-list');
            categories.forEach(category => {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.href = `/category/${category.category_id}/questions`; // Make sure the endpoint matches your server's route
                link.textContent = category.category_name;
                item.appendChild(link);
                list.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
});
