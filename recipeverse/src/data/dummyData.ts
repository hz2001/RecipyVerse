export interface Recipe {
  id: string;
  name: string;
  creator: string;
  region: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  tags: string[];
  createdAt: string;
  ipfsHash: string;
}

export const recipes: Recipe[] = [
  {
    id: '1',
    name: '红烧肉 (Hongshao Rou - Red Braised Pork Belly)',
    creator: '0xABC123...456',
    region: 'China',
    ingredients: [
      '500g pork belly, cut into 2cm cubes',
      '2 tablespoons vegetable oil',
      '3 tablespoons sugar',
      '3 tablespoons Shaoxing wine',
      '1 tablespoon light soy sauce',
      '2 tablespoons dark soy sauce',
      '2 cups water or stock',
      '2 spring onions, cut into sections',
      '2 slices ginger',
      '2 star anise',
      '1 cinnamon stick',
      '2 bay leaves'
    ],
    instructions: [
      'Bring a pot of water to boil and blanch the pork belly pieces for 3-4 minutes. Drain and rinse.',
      'Heat oil in a wok over medium heat. Add sugar and stir until it melts and turns amber.',
      'Add the pork belly pieces and stir to coat with caramelized sugar.',
      'Pour in Shaoxing wine, light and dark soy sauces, and enough water to just cover the meat.',
      'Add spring onions, ginger, star anise, cinnamon, and bay leaves.',
      'Bring to a boil, then reduce heat to low and simmer covered for 45-60 minutes until meat is tender.',
      'Remove lid and increase heat to reduce sauce until it coats the meat. Serve hot with steamed rice.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1623689048105-a17b1e1936b2',
    tags: ['Chinese', 'Pork', 'Main Dish', 'Traditional'],
    createdAt: '2023-10-15T14:30:00Z',
    ipfsHash: 'QmXyZ123AbC456dEF789gHi'
  },
  {
    id: '2',
    name: 'Pasta Carbonara',
    creator: '0xDEF789...012',
    region: 'Italy',
    ingredients: [
      '400g spaghetti',
      '200g guanciale or pancetta, diced',
      '4 large eggs',
      '100g Pecorino Romano cheese, grated',
      '50g Parmigiano Reggiano cheese, grated',
      'Freshly ground black pepper',
      'Salt for pasta water'
    ],
    instructions: [
      'Bring a large pot of salted water to boil and cook pasta according to package instructions until al dente.',
      'While pasta cooks, fry guanciale in a large pan until crispy but not burnt. Remove from heat.',
      'In a bowl, whisk eggs and mix in grated cheeses and plenty of black pepper.',
      'Drain pasta, reserving a cup of pasta water.',
      'Working quickly, add hot pasta to the pan with guanciale, then pour in egg mixture and toss rapidly.',
      'Add a splash of reserved pasta water to create a creamy sauce. The residual heat will cook the eggs without scrambling them.',
      'Serve immediately with additional grated cheese and black pepper.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
    tags: ['Italian', 'Pasta', 'Main Dish', 'Quick'],
    createdAt: '2023-09-22T18:45:00Z',
    ipfsHash: 'QmAbC123xYz456DEf789GHi'
  },
  {
    id: '3',
    name: 'Butter Chicken (Murgh Makhani)',
    creator: '0xGHI456...789',
    region: 'India',
    ingredients: [
      '800g boneless chicken thighs, cut into pieces',
      '2 tablespoons lemon juice',
      '3 tablespoons yogurt',
      '2 teaspoons garam masala',
      '2 teaspoons ground cumin',
      '2 teaspoons ground coriander',
      '1 teaspoon turmeric',
      '2 tablespoons ghee or oil',
      '1 large onion, finely chopped',
      '4 cloves garlic, minced',
      '2 tablespoons ginger, grated',
      '2 green chilies, chopped',
      '400g tomato puree',
      '250ml heavy cream',
      '2 tablespoons butter',
      'Fresh coriander for garnish'
    ],
    instructions: [
      'Marinate chicken with lemon juice, yogurt, and half of the spices for at least 2 hours or overnight.',
      'Heat ghee in a large pan and cook marinated chicken until browned. Remove and set aside.',
      'In the same pan, sauté onions until golden brown. Add garlic, ginger, and green chilies and cook for 2 minutes.',
      'Add remaining spices and cook for 1 minute until fragrant.',
      'Add tomato puree and simmer for 15 minutes until sauce thickens.',
      'Blend the sauce until smooth, then return to the pan.',
      'Add cream, butter, and cooked chicken. Simmer for 10-15 minutes until chicken is fully cooked and sauce is rich.',
      'Garnish with fresh coriander and serve with naan or rice.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db',
    tags: ['Indian', 'Chicken', 'Main Dish', 'Creamy'],
    createdAt: '2023-11-05T20:15:00Z',
    ipfsHash: 'QmJkL123mNo456PqR789sTu'
  },
  {
    id: '4',
    name: 'Bibimbap (비빔밥)',
    creator: '0xJKL789...012',
    region: 'Korea',
    ingredients: [
      '2 cups short-grain rice, cooked',
      '200g beef sirloin, thinly sliced',
      '1 tablespoon soy sauce',
      '1 tablespoon sesame oil',
      '2 teaspoons sugar',
      '2 cloves garlic, minced',
      '100g spinach, blanched',
      '100g bean sprouts, blanched',
      '1 carrot, julienned and sautéed',
      '1 zucchini, julienned and sautéed',
      '100g shiitake mushrooms, sliced and sautéed',
      '4 eggs, fried sunny-side up',
      '4 tablespoons gochujang (Korean chili paste)',
      'Sesame seeds and green onions for garnish'
    ],
    instructions: [
      'Marinate beef in soy sauce, 1 teaspoon sesame oil, sugar, and garlic for 30 minutes.',
      'Season each vegetable separately with salt and sesame oil after cooking.',
      'Cook marinated beef in a pan until browned and fully cooked.',
      'Arrange rice in four bowls. Place beef and vegetables in separate sections on top of rice.',
      'Place fried egg in the center of each bowl.',
      'Serve with gochujang on the side. Before eating, mix everything together thoroughly.',
      'Garnish with sesame seeds and chopped green onions.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7',
    tags: ['Korean', 'Rice', 'Main Dish', 'Healthy'],
    createdAt: '2023-12-10T12:00:00Z',
    ipfsHash: 'QmUvW123xYz456ABc789DEf'
  },
  {
    id: '5',
    name: 'Paella Valenciana',
    creator: '0xMNO012...345',
    region: 'Spain',
    ingredients: [
      '400g bomba or calasparra rice',
      '1 liter chicken stock',
      'Pinch of saffron threads',
      '8 chicken thighs',
      '200g rabbit, cut into pieces (optional)',
      '200g green beans, trimmed',
      '1 red bell pepper, sliced',
      '1 large tomato, grated',
      '1 onion, finely chopped',
      '4 cloves garlic, minced',
      '1 teaspoon smoked paprika',
      '100g frozen peas',
      'Olive oil',
      'Lemon wedges to serve',
      'Fresh rosemary sprigs'
    ],
    instructions: [
      'Heat stock with saffron threads and keep warm.',
      'In a paella pan, heat olive oil and brown chicken and rabbit pieces. Set aside.',
      'In the same pan, sauté onion, garlic, and bell pepper until softened.',
      'Add grated tomato and paprika, cook for 2-3 minutes.',
      'Return meat to the pan, add green beans and cook for 5 minutes.',
      'Add rice and stir to coat in oil and flavors.',
      'Pour in hot stock, spread ingredients evenly, and do not stir from this point on.',
      'Simmer for 15 minutes on medium heat, then reduce heat and cook for another 5-10 minutes.',
      'Scatter peas on top, place rosemary sprigs, and continue cooking until rice is done and liquid absorbed.',
      'Remove from heat, cover with a cloth, and let rest for 5-10 minutes before serving.',
      'Serve with lemon wedges.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
    tags: ['Spanish', 'Rice', 'Main Dish', 'Seafood'],
    createdAt: '2024-01-20T19:30:00Z',
    ipfsHash: 'QmGhI123jKl456MnO789PqR'
  }
]; 