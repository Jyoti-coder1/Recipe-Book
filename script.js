// --- Page Navigation Elements ---
const homePage = document.getElementById("homePage");
const appContent = document.getElementById("appContent");
const viewRecipesPage = document.getElementById("viewRecipesPage");

const goToAdd = document.getElementById("goToAdd");
const goToView = document.getElementById("goToView");
const viewAllBtn = document.getElementById("viewAllBtn");
const backBtn = document.getElementById("backBtn");

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
const commentInput = document.getElementById("commentInput");
const addCommentBtn = document.getElementById("addCommentBtn");
const closeModal = document.querySelector(".close");

let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
let editIndex = null;
let currentUser = "You"; // placeholder for user
let currentModalIndex = null;

// --- Navigation & Back Button ---
function updateBackBtn() {
    const isHome = homePage.style.display !== "none";
    backBtn.style.display = isHome ? "none" : "block";
}

function showAddPage() {
    homePage.style.display = "none";
    appContent.style.display = "block";
    viewRecipesPage.style.display = "none";
    updateBackBtn();
    history.pushState({ page: "add" }, "", "#add");
}

function showViewPage() {
    homePage.style.display = "none";
    appContent.style.display = "none";
    viewRecipesPage.style.display = "block";
    displayRecipes();
    updateBackBtn();
    history.pushState({ page: "view" }, "", "#view");
}

goToAdd.addEventListener("click", showAddPage);
goToView.addEventListener("click", showViewPage);
viewAllBtn.addEventListener("click", showViewPage);

backBtn.addEventListener("click", () => {
    window.history.back();
});

window.addEventListener("popstate", (event) => {
    if (!event.state) {
        homePage.style.display = "flex";
        appContent.style.display = "none";
        viewRecipesPage.style.display = "none";
    } else if (event.state.page === "add") showAddPage();
    else if (event.state.page === "view") showViewPage();
    updateBackBtn();
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
            user: currentUser,
            comments: []
        };

        if (editIndex !== null) {
            recipeData.user = recipes[editIndex].user;
            recipeData.comments = recipes[editIndex].comments || [];
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

// --- Display Recent Recipe ---
function displayRecentRecipe() {
    recentContainer.innerHTML = "";
    if (recipes.length === 0) {
        recentContainer.innerHTML = "<p>No recent recipe added yet.</p>";
        return;
    }

    const latest = recipes[recipes.length - 1];
    const card = createRecipeCard(latest, recipes.length - 1);
    recentContainer.appendChild(card);
}

// --- Display All Recipes ---
function displayRecipes(filter = "") {
    cardsContainer.innerHTML = "";
    const filtered = recipes.filter(
        r => r.name.toLowerCase().includes(filter.toLowerCase()) ||
            r.ingredients.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        cardsContainer.innerHTML = "<p class='no-result'>No recipes found!</p>";
        return;
    }

    filtered.forEach((recipe, index) => {
        const card = createRecipeCard(recipe, index);
        cardsContainer.appendChild(card);
    });
}

// --- Create Recipe Card ---
function createRecipeCard(recipe, index) {
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
    viewBtn.addEventListener("click", () => showModal(recipe, index));

    btnContainer.appendChild(viewBtn);

    if (recipe.user === currentUser) {
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.addEventListener("click", () => editRecipe(index));
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", () => deleteRecipe(index));
        btnContainer.append(editBtn, deleteBtn);
    }

    card.append(img, title, btnContainer);
    return card;
}

// --- Modal Functions ---
function showModal(recipe, index) {
    currentModalIndex = index;
    modalName.textContent = recipe.name;
    modalImage.src = recipe.image;
    modalIngredients.textContent = recipe.ingredients;
    const stepsArray = recipe.steps.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
    modalSteps.innerHTML = stepsArray.map((s, i) => `${i + 1}. ${s}`).join("<br>");
    displayComments(recipe);
    modal.style.display = "block";
}

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});

// --- Comments Functions ---
function displayComments(recipe) {
    const commentsContainer = modal.querySelector(".comments-container");
    commentsContainer.innerHTML = "";
    if (!recipe.comments || recipe.comments.length === 0) {
        commentsContainer.innerHTML = "<p>No comments yet.</p>";
        return;
    }
    recipe.comments.forEach(c => {
        const p = document.createElement("p");
        p.textContent = `${c.user}: ${c.text}`;
        commentsContainer.appendChild(p);
    });
}

addCommentBtn.addEventListener("click", () => {
    const text = commentInput.value.trim();
    if (!text || currentModalIndex === null) return;
    recipes[currentModalIndex].comments.push({ user: currentUser, text });
    saveRecipes();
    displayComments(recipes[currentModalIndex]);
    commentInput.value = "";
});

// --- Edit/Delete/Search ---
function editRecipe(index) {
    const recipe = recipes[index];
    nameInput.value = recipe.name;
    ingredientsInput.value = recipe.ingredients;
    stepsInput.value = recipe.steps;
    imageInput.value = "";
    editIndex = index;
    showAddPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteRecipe(index) {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    recipes.splice(index, 1);
    saveRecipes();
    alert("🗑 Recipe deleted successfully!");
}

// --- Search ---
searchInput.addEventListener("input", (e) => displayRecipes(e.target.value));

// --- Initial Load ---
displayRecentRecipe();
displayRecipes();
updateBackBtn();