import { useState } from 'react';

const RecipeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    ingredients: [''],
    instructions: [''],
    tags: '',
    image: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = [...formData.ingredients];
      newIngredients.splice(index, 1);
      setFormData({ ...formData, ingredients: newIngredients });
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ''] });
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = [...formData.instructions];
      newInstructions.splice(index, 1);
      setFormData({ ...formData, instructions: newInstructions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', isError: false });

    try {
      // Simulate IPFS upload and blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful transaction
      setMessage({ 
        text: 'Recipe successfully minted as an NFT! Transaction hash: 0x123...abc', 
        isError: false 
      });
      
      // Reset form
      setFormData({
        name: '',
        region: '',
        ingredients: [''],
        instructions: [''],
        tags: '',
        image: null,
      });
    } catch (error) {
      setMessage({ 
        text: 'Error submitting recipe. Please try again.', 
        isError: true 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const REGIONS = [
    { value: 'all', label: 'All Regions' },
    { value: 'argentina', label: 'Argentina' },
    { value: 'australia', label: 'Australia' },
    { value: 'austria', label: 'Austria' },
    { value: 'belgium', label: 'Belgium' },
    { value: 'brazil', label: 'Brazil' },
    { value: 'canada', label: 'Canada' },
    { value: 'chile', label: 'Chile' },
    { value: 'china', label: 'China' },
    { value: 'colombia', label: 'Colombia' },
    { value: 'cuba', label: 'Cuba' },
    { value: 'czech', label: 'Czech Republic' },
    { value: 'denmark', label: 'Denmark' },
    { value: 'egypt', label: 'Egypt' },
    { value: 'ethiopia', label: 'Ethiopia' },
    { value: 'finland', label: 'Finland' },
    { value: 'france', label: 'France' },
    { value: 'germany', label: 'Germany' },
    { value: 'greece', label: 'Greece' },
    { value: 'hungary', label: 'Hungary' },
    { value: 'iceland', label: 'Iceland' },
    { value: 'india', label: 'India' },
    { value: 'indonesia', label: 'Indonesia' },
    { value: 'ireland', label: 'Ireland' },
    { value: 'israel', label: 'Israel' },
    { value: 'italy', label: 'Italy' },
    { value: 'jamaica', label: 'Jamaica' },
    { value: 'japan', label: 'Japan' },
    { value: 'korea', label: 'Korea' },
    { value: 'lebanon', label: 'Lebanon' },
    { value: 'malaysia', label: 'Malaysia' },
    { value: 'mexico', label: 'Mexico' },
    { value: 'morocco', label: 'Morocco' },
    { value: 'netherlands', label: 'Netherlands' },
    { value: 'new-zealand', label: 'New Zealand' },
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'norway', label: 'Norway' },
    { value: 'peru', label: 'Peru' },
    { value: 'philippines', label: 'Philippines' },
    { value: 'poland', label: 'Poland' },
    { value: 'portugal', label: 'Portugal' },
    { value: 'russia', label: 'Russia' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'south-africa', label: 'South Africa' },
    { value: 'spain', label: 'Spain' },
    { value: 'sweden', label: 'Sweden' },
    { value: 'switzerland', label: 'Switzerland' },
    { value: 'thailand', label: 'Thailand' },
    { value: 'trinidad', label: 'Trinidad & Tobago' },
    { value: 'turkey', label: 'Turkey' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ukraine', label: 'Ukraine' },
    { value: 'usa', label: 'USA' },
    { value: 'vietnam', label: 'Vietnam' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Recipe NFT</h2>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Recipe Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Enter the name of your recipe"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="region" className="block text-gray-700 font-medium mb-2">Region/Origin</label>
        <select
          id="region"
          name="region"
          value={formData.region}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {REGIONS.map((region, index) => (
            <option key={index} value={region.value}>
              {region.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Ingredients</label>
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={`Ingredient ${index + 1}`}
              required
            />
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
              disabled={formData.ingredients.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          + Add Ingredient
        </button>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Instructions</label>
        {formData.instructions.map((instruction, index) => (
          <div key={index} className="flex mb-2">
            <textarea
              value={instruction}
              onChange={(e) => handleInstructionChange(index, e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={`Step ${index + 1}`}
              rows={2}
              required
            />
            <button
              type="button"
              onClick={() => removeInstruction(index)}
              className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors self-start"
              disabled={formData.instructions.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addInstruction}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          + Add Step
        </button>
      </div>
      
      <div className="mb-6">
        <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">Tags (comma separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="e.g., Vegetarian, Spicy, Breakfast"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="image" className="block text-gray-700 font-medium mb-2">Recipe Image</label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleImageChange}
          accept="image/*"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <p className="text-sm text-gray-500 mt-1">Max file size: 5MB. Recommended: 1200x800px</p>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-amber-500 text-white py-3 px-4 rounded-md font-medium ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-amber-600'
          } transition-colors`}
        >
          {isSubmitting ? 'Processing...' : 'Mint Recipe NFT'}
        </button>
        <p className="text-sm text-gray-500 text-center mt-3">
          This will store your recipe on IPFS and mint an NFT on the blockchain
        </p>
      </div>
    </form>
  );
};

export default RecipeForm; 