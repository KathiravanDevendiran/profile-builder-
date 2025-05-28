document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('portfolio-form');
    const inputPage = document.getElementById('input-page');
    const previewPage = document.getElementById('preview-page');
    const previewContent = document.getElementById('preview-content');
    const generateBtn = document.getElementById('generate-portfolio');
    const backBtn = document.getElementById('back-to-edit');
    const downloadPdfBtn = document.getElementById('download-pdf');

    generateBtn.addEventListener('click', function () {
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const about = document.getElementById('about').value;
        const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());
        const projectTitle = document.getElementById('project-title').value;
        const projectDescription = document.getElementById('project-description').value;
        const projectLink = document.getElementById('project-link').value;
        const template = document.getElementById('template').value;
        const accentColor = document.getElementById('accent-color').value;
        const fontFamily = document.getElementById('font-family').value;
        const layoutStyle = document.getElementById('layout-style').value;
        const profilePicInput = document.getElementById('profile-pic');
        const certificatesInput = document.getElementById('certificates');

        // Choose layout class
        let layoutClass = '';
        if (layoutStyle === 'card') layoutClass = 'portfolio-card';
        else if (layoutStyle === 'bordered') layoutClass = 'portfolio-bordered';
        else layoutClass = 'portfolio-block';

        // Handle certificates preview
        function handleCertificates(callback) {
            const files = certificatesInput.files;
            if (!files || files.length === 0) {
                callback('');
                return;
            }
            let previews = [];
            let loaded = 0;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        previews[i] = `<img src="${e.target.result}" class="certificate-thumb" alt="Certificate ${i+1}">`;
                        loaded++;
                        if (loaded === files.length) callback(previews.join(' '));
                    };
                    reader.readAsDataURL(file);
                } else if (file.type === 'application/pdf') {
                    // Show as link (cannot preview PDF inline in html2pdf easily)
                    previews[i] = `<span class="certificate-link">PDF: Certificate ${i+1}</span>`;
                    loaded++;
                    if (loaded === files.length) callback(previews.join(' '));
                } else {
                    loaded++;
                    if (loaded === files.length) callback(previews.join(' '));
                }
            }
        }

        // Function to build and show the preview
        function showPreview(profilePicUrl = '', certificatePreviews = '') {
            let imgHtml = profilePicUrl
                ? `<img src="${profilePicUrl}" alt="Profile Photo" class="passport-photo">`
                : '';

            let certHtml = certificatePreviews
                ? `<div class="certificates-preview"><h4>Certificates</h4>${certificatePreviews}</div>`
                : '';

            let html = `
                <div class="${layoutClass}" style="font-family:${fontFamily}; --accent:${accentColor}; position:relative;">
                    ${imgHtml}
                    <h3 style="color:${accentColor}">${name}</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>About Me:</strong> ${about}</p>
                    <h4 style="color:${accentColor}">Skills</h4>
                    <ul>${skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
                    <h4 style="color:${accentColor}">Projects</h4>
                    <p><strong>${projectTitle}</strong></p>
                    <p>${projectDescription}</p>
                    <p><a href="${projectLink}" target="_blank" style="color:${accentColor}">View Project</a></p>
                    ${certHtml}
                </div>
            `;
            previewContent.innerHTML = html;
            inputPage.style.display = 'none';
            previewPage.style.display = 'block';
        }

        // Handle profile photo and certificates
        if (profilePicInput.files && profilePicInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                handleCertificates(function (certHtml) {
                    showPreview(e.target.result, certHtml);
                });
            };
            reader.readAsDataURL(profilePicInput.files[0]);
        } else {
            handleCertificates(function (certHtml) {
                showPreview('', certHtml);
            });
        }
    });

    backBtn.addEventListener('click', function () {
        previewPage.style.display = 'none';
        inputPage.style.display = 'block';
    });

    downloadPdfBtn.addEventListener('click', function () {
        // Ensure all images in preview-content are loaded before generating PDF
        const images = previewContent.querySelectorAll('img');
        if (images.length === 0) {
            html2pdf().from(previewContent).save('portfolio.pdf');
        } else {
            let loaded = 0;
            images.forEach(img => {
                if (img.complete) {
                    loaded++;
                    if (loaded === images.length) html2pdf().from(previewContent).save('portfolio.pdf');
                } else {
                    img.onload = () => {
                        loaded++;
                        if (loaded === images.length) html2pdf().from(previewContent).save('portfolio.pdf');
                    };
                }
            });
        }
    });
});