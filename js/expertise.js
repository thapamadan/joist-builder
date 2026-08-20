(function () {
    "use strict";

    // This is the single source for expertise images and copy across the site.
    var expertise = [
        {
            id: "construction-works",
            title: "Construction Works",
            shortTitle: "Construction",
            image: "img/construction.jpeg",
            alt: "Residential construction project",
            summary: "Residential and commercial construction coordinated from site planning through finishing.",
            description: "We deliver residential and commercial construction through one coordinated process. From site preparation and material planning to supervision, quality checks and final finishing, every stage is managed around clear drawings, realistic schedules and dependable workmanship."
        },
        {
            id: "renovation-remodeling",
            title: "Renovation & Remodeling",
            shortTitle: "Renovation",
            image: "img/rennovation.jpg",
            alt: "Renovation and remodeling work",
            summary: "Existing spaces reworked around structure, comfort, function and realistic budgets.",
            description: "We give existing buildings a useful next chapter. Our team assesses current conditions, identifies practical structural and spatial improvements, and coordinates repair, extension, remodeling and finishes while respecting the character and constraints of the original space."
        },
        {
            id: "architectural-design",
            title: "Architectural Design",
            shortTitle: "Architecture",
            image: "img/3d-design.jpeg",
            alt: "Architectural planning project",
            summary: "Practical layouts, elevations, working drawings and visualization made for construction.",
            description: "Our architectural work turns ideas into spaces that are clear, buildable and suited to their setting. We develop layouts, elevations, working drawings and visualizations together, helping clients understand scale, movement, light and materials before construction begins."
        },
        {
            id: "interior-design",
            title: "Interior Design",
            shortTitle: "Interiors",
            image: "img/interior-design.jpeg",
            alt: "Interior design project",
            summary: "Materials, lighting, furniture and storage planned around everyday usability.",
            description: "We shape interiors around how people actually live and work. Space planning, lighting, materials, furniture and storage are developed as one composition, balancing visual character with comfort, maintenance, budget and long-term everyday use."
        },
        {
            id: "structural-estimation",
            title: "Structural & Estimation",
            shortTitle: "Engineering",
            image: "img/estimation.jpg",
            alt: "Structural engineering assessment",
            summary: "Safe structural decisions, practical detailing and cost guidance for confident planning.",
            description: "Sound engineering makes confident decisions possible. We provide structural analysis, practical detailing, quantity and cost estimation, and valuation support so design ambitions remain safe, efficient and financially grounded from the earliest planning stage."
        },
        {
            id: "surveying",
            title: "Surveying",
            shortTitle: "Surveying",
            image: "img/survey.jpeg",
            alt: "Site surveying and assessment",
            summary: "Site measurement, plotting and existing-condition assessment before work begins.",
            description: "Accurate site information is the starting point for reliable design and construction. We carry out measurements, plotting support and existing-condition checks to establish the dimensions, levels and constraints the project team needs before major decisions are made."
        }
    ];

    function twoDigits(number) {
        return String(number + 1).padStart(2, "0");
    }

    function renderHomeCards(container) {
        container.innerHTML = expertise.map(function (item, index) {
            return '<a class="expertise-card expertise-card--' + item.id + '" href="service.html#' + item.id + '">' +
                '<span class="media-fill" aria-hidden="true" style="background-image: url(' + item.image + ')"></span>' +
                '<img loading="lazy" src="' + item.image + '" alt="' + item.alt + '">' +
                '<span class="expertise-card-number">' + twoDigits(index) + '</span>' +
                '<div class="expertise-card-copy"><h3>' + item.title + '</h3><div><p>' + item.summary + '</p>' +
                '<span>More on ' + item.shortTitle + ' <i class="fa fa-chevron-right" aria-hidden="true"></i></span></div></div>' +
                '</a>';
        }).join("");
    }

    function renderExpertiseSections(container) {
        container.innerHTML = expertise.map(function (item, index) {
            return '<article class="expertise-detail" id="' + item.id + '">' +
                '<div class="expertise-detail-media">' +
                '<span class="media-fill" aria-hidden="true" style="background-image: url(' + item.image + ')"></span>' +
                '<img loading="lazy" src="' + item.image + '" alt="' + item.alt + '"></div>' +
                '<div class="expertise-detail-copy"><span class="expertise-detail-number">' + twoDigits(index) + ' / 06</span>' +
                '<h2>' + item.title + '</h2><p>' + item.description + '</p>' +
                '<a href="contact.html">Discuss your project <i class="fa fa-chevron-right" aria-hidden="true"></i></a></div>' +
                '</article>';
        }).join("");
    }

    var homeGrid = document.querySelector("[data-expertise-grid]");
    var detailList = document.querySelector("[data-expertise-details]");

    if (homeGrid) {
        renderHomeCards(homeGrid);
    }

    if (detailList) {
        renderExpertiseSections(detailList);
    }
}());
