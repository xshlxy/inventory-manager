// components/RecipeComponent.js
import React, { useEffect, useState } from 'react';

function RecipeComponent() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch('/api/fetchRecipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: 'Provide me some recipe ideas' })
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setRecipes(data.recipes); // Ensure `data.recipes` is an array
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <ul>
          {recipes.map((recipe, index) => (
            <li key={index}>{recipe}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecipeComponent;
