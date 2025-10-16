window.addEventListener('DOMContentLoaded',function(){

    const meal_api = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
  const random_api = "https://www.themealdb.com/api/json/v1/1/random.php";

   let search_form = document.querySelector(".search-box");
  let search_input = document.querySelector("#search-input");
  let message = document.querySelector(".message");
  let result_grid = document.querySelector("#result-grid");
  let random_btn = document.querySelector("#random-btn");
  let history_section = document.querySelector("#history-section");
  const modal = document.getElementById("recipe-modal");
const modalClose = document.getElementById("modal-close");
const recipeDetails = document.getElementById("recipe-details");

  storage=JSON.parse(localStorage.getItem("history_recipes"))||[];

  let ditails_recipe=[];

    const today = new Date().toISOString().split('T')[0];
  const stored = JSON.parse(localStorage.getItem('daily_recipe'));
  if (!stored || stored.date !== today) {
    random_btn.textContent = "🍔 Today's Special Recipe";
    random_btn.disabled = false;
  } else {
    random_btn.textContent = "🤝Today's Recipe Saved";
    random_btn.disabled = true;
  }

  //search recepies
  search_form.addEventListener('submit', async (search) => {

    search.preventDefault();
    let search_recipe = search_input.value.trim();

    if (search_recipe === "") {
      showMessage("🛑 Please Enter a Recipe Name", "orange");
      return;
    }

    try {
      let response = await fetch(meal_api + search_recipe);
      let data = await response.json();

      if (!data.meals) {
        showMessage("❌ Result Not Found", "green");
      } else {
        display(data.meals);
        data.meals.forEach(meal => save(meal));
      }
    } catch (error) {
      console.log("error is:", error);
      showMessage("⚠️ Something Went Wrong! Please Try again Later.", "orange");
    }
  });


  // random recipes generation
  random_btn.addEventListener('click', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = JSON.parse(localStorage.getItem("daily_recipe"));

      if (stored && stored.date === today) {
        display([stored.recipe]);
        random_btn.textContent = "Generated";
        random_btn.disabled = true;
        return;
      }

      let response = await fetch(random_api);
      let daily_recipe = await response.json();

      if (!daily_recipe.meals) {
        showMessage("❌ Result Not Found", "green");
        return;
      }

      display(daily_recipe.meals);
      daily_recipe.meals.forEach(meal=>save(meal));

      localStorage.setItem("daily_recipe", JSON.stringify({ date: today, recipe: daily_recipe.meals[0] }));
      random_btn.textContent = "Generated";
      random_btn.disabled = true;
    } catch (error) {
      console.log("error is", error);
      showMessage("⚠️ Something Went Wrong! Please Try again Later.", "orange");
    }
  });

  // text message 
    function showMessage(text, paint) {
    message.textContent = text;
    message.style.color = paint;
    setTimeout(() => { message.textContent = ""; }, 2000);
  }

  //dispaly Recipes 
  function display(recipe) {
    result_grid.textContent = "";
    details_recipe = recipe;
    recipe.forEach(meal => {
      let card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${meal.strMealThumb}" alt="Error">
        <h3>${meal.strMeal}</h3>
        <button class="view">View Recipe</button>
      `;
      result_grid.appendChild(card);
    });
  }

  //History recipes to show history section
  function showHistory() {
    history_section.textContent = "";
    storage.forEach(meal => {
      let card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${meal.image}" alt="Error"> 
        <h3>${meal.name}</h3>
        <div class="button-card">
          <button class="view">View</button>
          <button class="delete">Delete</button>
        </div>
      `;
      history_section.appendChild(card);
    });
  }

  // save meals data at cache
  function save(meal) {
    const ingredients_list = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient_name = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient_name && ingredient_name.trim() !== "") {
        ingredients_list.push({ name: ingredient_name, quantity: measure });
      }
    }

    const my_recipe = {
      name: meal.strMeal,
      image: meal.strMealThumb,
      ingredients: ingredients_list,
      instructions: meal.strInstructions,
      source: meal.strSource
    };

    if (!storage.some(r => r.name === meal.strMeal)) {
      storage.push(my_recipe);
      localStorage.setItem("history_recipes", JSON.stringify(storage));
      showHistory();
    }
  }

//history section's delete and view control(Event Delegation)
history_section.addEventListener('click', function (e) {

    if (e.target.classList.contains("delete")) {
      const recipe = e.target.closest(".card").querySelector("h3").textContent;
      storage = storage.filter(m => m.name !== recipe);
      localStorage.setItem("history_recipes", JSON.stringify(storage));

      showHistory();
    }

    if (e.target.classList.contains("view")) {
      const recipe = e.target.closest(".card").querySelector("h3").textContent;
      const meal = storage.find(m => m.name === recipe);
      if (meal) showRecipeModal(meal);
    }
  });

// result_grid's viwe button control
 result_grid.addEventListener("click", function (e) {
    if (e.target.classList.contains("view")) {
      const recipe = e.target.closest(".card").querySelector("h3").textContent;
      const meal = details_recipe.find(m => m.strMeal === recipe || m.name === recipe);
      if (meal) showRecipeModal(meal);
    }
  });


// show recipe in details as a pop up
function showRecipeModal(meal) {
    recipeDetails.innerHTML = `
      <h2>${meal.strMeal || meal.name}</h2>
      <img src="${meal.image || meal.strMealThumb}" alt="${meal.name || meal.strMeal}">
      <h3>🧂 Ingredients:</h3>
      <ul>
        ${(meal.ingredients || []).map(el => `<li>${el.name} - ${el.quantity}</li>`).join('')}
      </ul>
      <p>${meal.instructions || meal.strInstructions}</p>
      ${meal.source ? `<a href="${meal.source}" target="_blank">🔗 Source</a>` : ""}
    `;
    modal.classList.add("show");
  }

//modal close button 

modalClose.addEventListener('click', function () {
    modal.classList.remove("show");
  });


// click outside to close the modal

 modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });

showHistory();

});