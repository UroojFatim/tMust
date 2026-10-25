const products = [
  {
    id: 'prod-1',
    slug: 'classic-shirt',
    title: 'Classic Shirt',
    price: 49.99,
    category: 'casual_wears',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['red', 'blue', 'black'],
    images: ['/products/img1.jpeg'],
    colorImages: [
      { color: 'red', image: '/products/img2.jpeg' },
      { color: 'blue', image: '/products/img3.jpeg' },
      { color: 'black', image: '/products/img4.jpeg' }
    ]
  },
  {
    id: 'prod-2',
    slug: 'linen-tunic',
    title: 'Linen Tunic',
    price: 69.99,
    category: 'traditional_wear',
    sizes: ['S', 'M', 'L'],
    colors: ['beige', 'pink'],
    images: ['/products/img5.jpeg'],
    colorImages: [
      { color: 'beige', image: '/products/img6.jpeg' },
      { color: 'pink', image: '/products/img7.jpeg' }
    ]
  },
  {
    id: 'prod-3',
    slug: 'summer-tee',
    title: 'Summer Tee',
    price: 29.99,
    category: 'new_arrivals',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['blue', 'black'],
    images: ['/products/img8.jpeg'],
    colorImages: [
      { color: 'blue', image: '/products/img9.jpeg' },
      { color: 'black', image: '/products/img10.jpeg' }
    ]
  },
  {
    id: 'prod-4',
    slug: 'evening-gown',
    title: 'Evening Gown',
    price: 129.99,
    category: 'fancy_party_wear',
    sizes: ['S', 'M', 'L'],
    colors: ['black', 'beige'],
    images: ['/products/img11.jpeg'],
    colorImages: [
      { color: 'black', image: '/products/img14.jpeg' },
      { color: 'beige', image: '/products/img13.jpeg' }
    ]
  },
  {
    id: 'prod-5',
    slug: 'pastel-kurta',
    title: 'Pastel Kurta',
    price: 59.99,
    category: 'traditional_wear',
    sizes: ['M', 'L', 'XL'],
    colors: ['pink', 'beige', 'blue'],
    images: ['/products/img15.jpeg'],
    colorImages: [
      { color: 'pink', image: '/products/img16.jpeg' },
      { color: 'beige', image: '/products/img17.jpeg' },
      { color: 'blue', image: '/products/img18.jpeg' }
    ]
  }
];

export default products;

