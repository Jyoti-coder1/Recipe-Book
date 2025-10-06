// --- Front Page Navigation ---
const homePage = document.getElementById("homePage");
const appContent = document.getElementById("appContent");
const goToAdd = document.getElementById("goToAdd");
const goToView = document.getElementById("goToView");

// Go to Add Recipe
goToAdd.addEventListener("click", () => {
    homePage.style.display = "none";
    appContent.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Go to View Recipes
goToView.addEventListener("click", () => {
    homePage.style.display = "none";
    appContent.style.display = "block";
    document.querySelector(".recipes-section").scrollIntoView({ behavior: "smooth" });
});

// Select elements
const recipeForm = document.getElementById("recipeForm");
const nameInput = document.getElementById("name");
const ingredientsInput = document.getElementById("ingredients");
const stepsInput = document.getElementById("steps");
const imageInput = document.getElementById("image");
const searchInput = document.getElementById("searchInput");
const cardsContainer = document.querySelector(".cards-container");

// Modal
const modal = document.getElementById("recipeModal");
const modalName = document.getElementById("modalName");
const modalImage = document.getElementById("modalImage");
const modalIngredients = document.getElementById("modalIngredients");
const modalSteps = document.getElementById("modalSteps");
const closeModal = document.querySelector(".close");

let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
let editIndex = null;

// Save recipes to localStorage
function saveRecipes() {
    localStorage.setItem("recipes", JSON.stringify(recipes));
    displayRecipes();
}

// Add or Update recipe
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
    } else if (editIndex !== null) {
        handleData(recipes[editIndex].image);
    } else {
        alert("Please upload an image.");
    }
});

// Display recipes
function displayRecipes(filter = "") {
    cardsContainer.innerHTML = "";

    const filtered = recipes.filter(
        (r) =>
            r.name.toLowerCase().includes(filter.toLowerCase()) ||
            r.ingredients.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        cardsContainer.innerHTML = "<p class='no-result'>No matching recipes found!</p>";
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

        // Action buttons
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

// Show recipe modal
function showModal(recipe) {
    modalName.textContent = recipe.name;
    modalImage.src = recipe.image;
    modalIngredients.textContent = recipe.ingredients;
    modalSteps.textContent = recipe.steps;
    modal.style.display = "block";

    document.getElementById("modalIngredients").previousElementSibling.className = "ingredients";
    document.getElementById("modalSteps").previousElementSibling.className = "steps";

    modal.style.display = "block";
}

// Edit recipe
function editRecipe(index) {
    const recipe = recipes[index];
    nameInput.value = recipe.name;
    ingredientsInput.value = recipe.ingredients;
    stepsInput.value = recipe.steps;
    imageInput.value = "";
    editIndex = index;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Delete recipe
function deleteRecipe(index) {
    if (confirm("Are you sure you want to delete this recipe?")) {
        recipes.splice(index, 1);
        saveRecipes();
        alert("🗑 Recipe deleted successfully!");
    }
}

// Close modal
closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});

// Search
searchInput.addEventListener("input", (e) => displayRecipes(e.target.value));

// On load
displayRecipes();