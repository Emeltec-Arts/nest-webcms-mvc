document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebarCollapseShow = document.getElementById('sidebarCollapseShow');
    const sidebar = document.querySelector('.sidebar');
    const content = document.getElementById('content');

    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
        });
    }

    if (sidebarCollapseShow) {
        sidebarCollapseShow.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInside = sidebar.contains(event.target) || 
                            (sidebarCollapseShow && sidebarCollapseShow.contains(event.target));

        if (!isClickInside && window.innerWidth <= 768 && !sidebar.classList.contains('active')) {
            sidebar.classList.add('active');
            content.classList.remove('active');
        }
    });
});
