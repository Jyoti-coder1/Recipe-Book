// --- Page Navigation Elements ---
const homePage = document.getElementById("homePage");
const appContent = document.getElementById("appContent");
const viewRecipesPage = document.getElementById("viewRecipesPage");

const goToAdd = document.getElementById("goToAdd");
const goToView = document.getElementById("goToView");
const viewAllBtn = document.getElementById("viewAllBtn");
const backBtn = document.getElementById("backBtn");

// --- Show/Hide Back Button based on current page ---
function updateBackBtn() {
    const isHome = homePage.style.display !== "none";
    if (!isHome) {
        backBtn.style.display = "block";
    }
    else {
        backBtn.style.display = "none";
    }
}

// --- Initial load ---
updateBackBtn();

// --- Back Button Click ---
backBtn.addEventListener("click", () => {
    // Simulate browser back behavior
    window.history.back();
});

// --- Navigation Handlers Update ---
function showAddPage(fromPopState = false) {
    homePage.style.display = "none";
    appContent.style.display = "block";
    viewRecipesPage.style.display = "none";
    if (!fromPopState) {
        history.pushState({ page: "add" }, "", "#add");
    }
    updateBackBtn();
}

function showViewPage(fromPopState = false) {
    homePage.style.display = "none";
    appContent.style.display = "none";
    viewRecipesPage.style.display = "block";
    displayRecipes();
    if (!fromPopState) {
        history.pushState({ page: "view" }, "", "#view");
    }
    updateBackBtn();
}

goToAdd.addEventListener("click", showAddPage);
goToView.addEventListener("click", showViewPage);
viewAllBtn.addEventListener("click", showViewPage);

// --- Browser Back/Forward Handling ---
window.addEventListener("popstate", (event) => {
    if (event.state) {
        if (event.state.page === "add") {
            showAddPage(true);
        } else if (event.state.page === "view") {
            showViewPage(true);
        }
    }
    else {
        // default: home page
        homePage.style.display = "flex";
        appContent.style.display = "none";
        viewRecipesPage.style.display = "none";
        updateBackBtn();
    }
});

// --- Form Elements ---
const recipeForm = document.getElementById("recipeForm");
const nameInput = document.getElementById("name");
const ingredientsInput = document.getElementById("ingredients");
const stepsInput = document.getElementById("steps");
const imageInput = document.getElementById("image");
const recentContainer = document.querySelector(".recent-container");
const cardsContainer = document.querySelector(".cards-container");
const searchInput = document.getElementById("searchInput");

// --- Modal Elements ---
const modal = document.getElementById("recipeModal");
const modalName = document.getElementById("modalName");
const modalImage = document.getElementById("modalImage");
const modalIngredients = document.getElementById("modalIngredients");
const modalSteps = document.getElementById("modalSteps");
const closeModal = document.querySelector(".close");

let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
let editIndex = null;

// --- Navigation Handlers ---
goToAdd.addEventListener("click", () => {
    homePage.style.display = "none";
    appContent.style.display = "block";
    viewRecipesPage.style.display = "none";
    history.pushState({ page: "add" }, "", "#add");
});

goToView.addEventListener("click", () => {
    homePage.style.display = "none";
    appContent.style.display = "none";
    viewRecipesPage.style.display = "block";
    displayRecipes();
    history.pushState({ page: "view" }, "", "#view");
});

viewAllBtn.addEventListener("click", () => {
    appContent.style.display = "none";
    viewRecipesPage.style.display = "block";
    displayRecipes();
    history.pushState({ page: "view" }, "", "#view");
});

// --- Handle Browser Back Button ---
window.addEventListener("popstate", (event) => {
    if (event.state) {
        if (event.state.page === "add") {
            homePage.style.display = "none";
            appContent.style.display = "block";
            viewRecipesPage.style.display = "none";
        }
        else if (event.state.page === "view") {
            homePage.style.display = "none";
            appContent.style.display = "none";
            viewRecipesPage.style.display = "block";
        }
    }
    else {
        // default: home page
        homePage.style.display = "flex";
        appContent.style.display = "none";
        viewRecipesPage.style.display = "none";
    }
});

// --- Save Recipes ---
function saveRecipes() {
    localStorage.setItem("recipes", JSON.stringify(recipes));
    displayRecentRecipe();
    displayRecipes();
}

// --- Add or Update Recipe ---
recipeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!nameInput.value || !ingredientsInput.value || !stepsInput.value) {
        alert("Please fill all fields and upload an image.");
        return;
    }

    const handleData = (imageSrc) => {
        const recipeData = {
            name: nameInput.value.trim(),
            ingredients: ingredientsInput.value.trim(),
            steps: stepsInput.value.trim(),
            image: imageSrc,
        };

        if (editIndex !== null) {
            recipes[editIndex] = recipeData;
            editIndex = null;
            alert("Recipe updated successfully!");
        } else {
            recipes.push(recipeData);
            alert("Recipe added successfully!");
        }

        saveRecipes();
        recipeForm.reset();
    };

    if (imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = () => handleData(reader.result);
        reader.readAsDataURL(imageInput.files[0]);
    }
    else if (editIndex !== null) {
        handleData(recipes[editIndex].image);
    }
    else {
        alert("Please upload an image.");
    }
});

// --- Show only Last Added Recipe with full card ---
function displayRecentRecipe() {
    recentContainer.innerHTML = "";
    if (recipes.length === 0) {
        recentContainer.innerHTML = "<p>No recent recipe added yet.</p>";
        return;
    }

    const latest = recipes[recipes.length - 1];
    const card = document.createElement("div");
    card.className = "recipe-card";

    const img = document.createElement("img");
    img.src = latest.image;
    img.alt = latest.name;

    const title = document.createElement("h3");
    title.textContent = latest.name;

    const btnContainer = document.createElement("div");
    btnContainer.className = "card-buttons";

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.className = "view-btn";
    viewBtn.addEventListener("click", () => showModal(latest));

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    const latestIndex = recipes.length - 1;
    editBtn.addEventListener("click", () => editRecipe(latestIndex));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => deleteRecipe(latestIndex));

    btnContainer.append(viewBtn, editBtn, deleteBtn);
    card.append(img, title, btnContainer);
    recentContainer.appendChild(card);
}

// --- Display All Recipes ---
function displayRecipes(filter = "") {
    cardsContainer.innerHTML = "";

    const filtered = recipes.filter(
        (r) =>
            r.name.toLowerCase().includes(filter.toLowerCase()) ||
            r.ingredients.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        cardsContainer.innerHTML = "<p class='no-result'>No recipes found!</p>";
        return;
    }

    filtered.forEach((recipe, index) => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        const img = document.createElement("img");
        img.src = recipe.image;
        img.alt = recipe.name;

        const title = document.createElement("h3");
        title.textContent = recipe.name;

        const btnContainer = document.createElement("div");
        btnContainer.className = "card-buttons";

        const viewBtn = document.createElement("button");
        viewBtn.textContent = "View";
        viewBtn.className = "view-btn";
        viewBtn.addEventListener("click", () => showModal(recipe));

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.addEventListener("click", () => editRecipe(index));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", () => deleteRecipe(index));

        btnContainer.append(viewBtn, editBtn, deleteBtn);
        card.append(img, title, btnContainer);
        cardsContainer.appendChild(card);
    });
}

// --- Modal Functions ---
function showModal(recipe) {
    modalName.textContent = recipe.name;
    modalImage.src = recipe.image;

    // Format preparation steps as numbered list
    const stepsArray = recipe.steps.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
    modalSteps.innerHTML = stepsArray.map((step, i) => `${i + 1}. ${step}`).join("<br>");

    modalIngredients.textContent = recipe.ingredients;

    modal.style.display = "block";
}

closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});

// --- Edit/Delete/Search ---
function editRecipe(index) {
    const recipe = recipes[index];
    nameInput.value = recipe.name;
    ingredientsInput.value = recipe.ingredients;
    stepsInput.value = recipe.steps;

    // Image handling: leave empty but use existing if not changed
    imageInput.value = "";
    editIndex = index;

    viewRecipesPage.style.display = "none";
    appContent.style.display = "block";
    history.pushState({ page: "add" }, "", "#add");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteRecipe(index) {
    if (confirm("Are you sure you want to delete this recipe?")) {
        recipes.splice(index, 1);
        saveRecipes();
        alert("🗑 Recipe deleted successfully!");
    }
}

searchInput.addEventListener("input", (e) => displayRecipes(e.target.value));

// --- Initial Load ---
displayRecentRecipe();
displayRecipes();