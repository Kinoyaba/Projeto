/**
 * Main JavaScript file for both landing page and dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navMenu = document.querySelector('.nav ul');
    
    if (mobileMenuIcon) {
        mobileMenuIcon.addEventListener('click', function() {
            navMenu.classList.toggle('show');
            
            if (navMenu.classList.contains('show')) {
                navMenu.style.display = 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '80px';
                navMenu.style.left = '0';
                navMenu.style.width = '100%';
                navMenu.style.backgroundColor = '#fff';
                navMenu.style.padding = '20px';
                navMenu.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
            } else {
                navMenu.style.display = '';
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenuIcon && navMenu.classList.contains('show')) {
                    navMenu.classList.remove('show');
                    navMenu.style.display = '';
                }
            }
        });
    });
    
    // Form submission handling (if on landing page)
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            const formData = new FormData(contactForm);
            const formValues = Object.fromEntries(formData.entries());
            
            // Show submission message
            contactForm.innerHTML = `
                <div class="form-success">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 20px;"></i>
                    <h3>Mensagem Enviada!</h3>
                    <p>Obrigado por entrar em contato, ${formValues.name}. Responderemos em breve.</p>
                </div>
            `;
        });
    }
    
    // Handle export buttons on dashboard
    document.querySelectorAll('.btn-export').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.id.replace('export', '');
            exportData(sectionId);
        });
    });
    
    // Function to export data as CSV
    function exportData(section) {
        // This is a simplified implementation
        // In a real application, this would generate a proper CSV file
        
        // Get current date for filename
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const filename = `dados-educacionais-${section.toLowerCase()}-${dateStr}.csv`;
        
        // Create a dummy CSV content based on the section
        let csvContent = "data:text/csv;charset=utf-8,";
        
        switch(section) {
            case 'Estudantes':
                csvContent += "Categoria,Valor,Percentual\n";
                csvContent += "Total de Estudantes,45678900,-\n";
                csvContent += "Estudantes em Escolas Públicas,38500000,84.3%\n";
                csvContent += "Estudantes em Escolas Privadas,7178900,15.7%\n";
                break;
            case 'Regioes':
                csvContent += "Região,IDEB,Taxa de Evasão,Índice de Infraestrutura\n";
                csvContent += "Norte,4.2,8.3%,5.6\n";
                csvContent += "Nordeste,4.5,7.9%,6.1\n";
                csvContent += "Centro-Oeste,5.3,6.2%,7.2\n";
                csvContent += "Sudeste,5.8,5.1%,7.8\n";
                csvContent += "Sul,5.7,4.9%,7.6\n";
                break;
            // Add more cases for other sections
            default:
                csvContent += "Não há dados disponíveis para exportação nesta seção.";
        }
        
        // Create a download link and trigger the download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show feedback to user
        alert(`Exportação de dados de ${section} concluída com sucesso!`);
    }
});