import {FoodItems} from '../../server/FoodItems';

const initialFoods = [
    {
    name: 'Lanzhou Beef Noodles',
    restaurant: 'Bowltiful',
    ingredients: ['beef', 'noodles', 'cilantro', 'radish', 'chili oil', 'star anise'],
    flavorProfile: {
      sweet: 2,
      salty: 7,
      sour: 1,
      bitter: 1,
      umami: 8,
      spicy: 6
    },
    cuisine: 'Chinese',
    category: 'main',
    textures: ['chewy', 'tender'],
    cookingMethods: ['boiled', 'braised']
}
];

// Meteor.startup(() => {
//   if (FoodItems.find().count() === 0) {
//     initialFoods.forEach(food => FoodItems.insert(food));
//   }
// });




