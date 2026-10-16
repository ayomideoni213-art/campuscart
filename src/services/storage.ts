import {
  UserProfile,
  Store,
  Product,
  Category,
  Order,
  Review,
  Conversation,
  NotificationItem,
  ReportItem,
  BlogPost,
  CampusOption
} from '../types';
import { EKITI_CAMPUSES, DEFAULT_CAMPUS, sanitizeCampus, isValidCampus } from '../data/campuses';

// Centralized Campus Options for Ekiti State, Nigeria
export const CAMPUS_OPTIONS: CampusOption[] = EKITI_CAMPUSES;

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-customer-1',
    email: 'maya.buyer@eksu.edu.ng',
    full_name: 'Maya Adebayo',
    role: 'customer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Ekiti State University (EKSU)',
    student_id: 'EKSU/2024/8842',
    phone: '+2348032348901',
    bio: 'Architecture student at EKSU. Passionate about campus thrifting and student-made art.',
    created_at: '2025-09-12T10:00:00Z',
    signup_intent: 'shop'
  },
  {
    id: 'user-seller-1',
    email: 'ayomide.tech@eksu.edu.ng',
    full_name: 'Ayomide Bello',
    role: 'seller',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Ekiti State University (EKSU)',
    student_id: 'EKSU/2023/4109',
    phone: '+2348053456789',
    bio: 'Senior Electrical Engineering student at EKSU. Founder of Ay\'s Tech Hub, providing durable tech gear across Ekiti campuses.',
    created_at: '2025-08-20T14:30:00Z',
    signup_intent: 'sell',
    campuses_served: [
      'Ekiti State University (EKSU)',
      'Federal University Oye-Ekiti (FUOYE)',
      'Afe Babalola University (ABUAD)'
    ]
  },
  {
    id: 'user-editor-1',
    email: 'sarah.editor@abuad.edu.ng',
    full_name: 'Sarah Ogundele',
    role: 'editor',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Afe Babalola University (ABUAD)',
    student_id: 'ABUAD/2023/7721',
    phone: '+2348124567890',
    bio: 'Editor & Student Council Liaison for marketplace safety and quality standards.',
    created_at: '2025-07-15T09:00:00Z',
    signup_intent: 'shop'
  },
  {
    id: 'user-author-1',
    email: 'david.author@fuoye.edu.ng',
    full_name: 'David Oladele',
    role: 'author',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Federal University Oye-Ekiti (FUOYE)',
    student_id: 'FUOYE/2024/1188',
    phone: '+2348135678901',
    bio: 'Campus Journalist at FUOYE. Writing about student founders, hustle culture, and smart budgeting.',
    created_at: '2025-08-01T11:20:00Z',
    signup_intent: 'shop'
  },
  {
    id: 'user-admin-1',
    email: 'admin@campusmart.ng',
    full_name: 'Alex Fashola',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Ekiti State University (EKSU)',
    student_id: 'EKSU/ADM/001',
    phone: '+2348029990011',
    bio: 'CampusMart Platform Co-Founder and Administrator. Ensuring fair, safe trade for students across Nigeria.',
    created_at: '2025-06-01T08:00:00Z',
    signup_intent: 'shop'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tech',
    name: 'Tech & Gadgets',
    slug: 'tech-gadgets',
    description: 'Fast chargers, power banks, keyboards, cables, dorm electronics & audio gear.',
    icon_name: 'Laptop',
    product_count: 8
  },
  {
    id: 'cat-fashion',
    name: 'Vintage & Apparel',
    slug: 'vintage-apparel',
    description: 'Curated thrift finds, student-made streetwear, hoodies, bespoke dresses and totes.',
    icon_name: 'Shirt',
    product_count: 6
  },
  {
    id: 'cat-food',
    name: 'Campus Bites & Snacks',
    slug: 'campus-bites',
    description: 'Fresh pastries, small chops, dorm-baked cookies, and study treats.',
    icon_name: 'Utensils',
    product_count: 5
  },
  {
    id: 'cat-books',
    name: 'Books & Course Materials',
    slug: 'books-notes',
    description: 'Textbooks, past questions, course summaries & exam preparation materials.',
    icon_name: 'BookOpen',
    product_count: 7
  },
  {
    id: 'cat-supplies',
    name: 'Hostel & Study Supplies',
    slug: 'dorm-supplies',
    description: 'Rechargeable desk lamps, stationery, organizers, planners, and room essentials.',
    icon_name: 'Pencil',
    product_count: 4
  },
  {
    id: 'cat-services',
    name: 'Student Services',
    slug: 'student-services',
    description: 'Peer tutoring, campus photography, graphic design, and laptop servicing.',
    icon_name: 'Sparkles',
    product_count: 3
  }
];

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-ays-tech',
    seller_id: 'user-seller-1',
    name: "Ay's Tech Hub",
    slug: 'ays-tech-hub',
    tagline: 'Reliable gadgets, durable power banks & tested cables across Ekiti.',
    description: 'Founded by senior Electrical Engineering student Ayomide Bello at EKSU. We test and curate durable GaN chargers, long-lasting power banks, braided cables, and audio gear built to survive hostel living and power surges.',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    profile_thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    campus_location: 'Ekiti State University (EKSU)',
    campuses_served: [
      'Ekiti State University (EKSU)',
      'Federal University Oye-Ekiti (FUOYE)',
      'Afe Babalola University (ABUAD)'
    ],
    pickup_point: 'Student Union Building (SUB) Walkway, EKSU',
    rating: 4.9,
    reviews_count: 48,
    total_sales: 142,
    status: 'active',
    created_at: '2025-08-25T12:00:00Z',
    instagram_handle: '@aystech_eksu',
    instagram_url: 'https://instagram.com/aystech_eksu',
    whatsapp_url: 'https://wa.me/2348053456789',
    verified_student: true
  },
  {
    id: 'store-campus-fashion',
    seller_id: 'user-seller-2',
    name: 'Ekiti Thrift & Vintage Hub',
    slug: 'ekiti-thrift-vintage',
    tagline: 'Sustainable college streetwear & reworked thrift pieces.',
    description: 'Curated by Chloe at ABUAD. We handpick top grade 90s vintage jackets, trendy denim, and eco-friendly screenprinted campus tote bags.',
    logo_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    profile_thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    campus_location: 'Afe Babalola University (ABUAD)',
    campuses_served: [
      'Afe Babalola University (ABUAD)',
      'Ekiti State University (EKSU)'
    ],
    pickup_point: 'Talent Discovery Centre (TDC) Forecourt',
    rating: 4.8,
    reviews_count: 34,
    total_sales: 89,
    status: 'active',
    created_at: '2025-09-01T10:00:00Z',
    instagram_handle: '@ekitithrift_abuad',
    instagram_url: 'https://instagram.com/ekitithrift_abuad',
    whatsapp_url: 'https://wa.me/2348124567890',
    verified_student: true
  },
  {
    id: 'store-student-bites',
    seller_id: 'user-seller-3',
    name: 'Oye Treats & Pastries',
    slug: 'oye-treats-pastries',
    tagline: 'Freshly baked meat pies, sausage rolls & cookies in Oye-Ekiti.',
    description: 'Fresh small chops, warm meat pies, and rich chocolate cookies baked fresh every morning before lectures. Perfect for hostel chill sessions and group revisions.',
    logo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
    profile_thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    campus_location: 'Federal University Oye-Ekiti (FUOYE)',
    campuses_served: [
      'Federal University Oye-Ekiti (FUOYE)'
    ],
    pickup_point: 'FUOYE Central Library Quad',
    rating: 5.0,
    reviews_count: 62,
    total_sales: 215,
    status: 'active',
    created_at: '2025-08-10T16:00:00Z',
    instagram_handle: '@oyetreats_fuoye',
    instagram_url: 'https://instagram.com/oyetreats_fuoye',
    whatsapp_url: 'https://wa.me/2348135678901',
    verified_student: true
  },
  {
    id: 'store-book-hub',
    seller_id: 'user-seller-4',
    name: 'Ikere Campus BookExchange',
    slug: 'ikere-book-exchange',
    tagline: 'Affordable textbooks, past questions & curated summaries.',
    description: 'Peer-to-peer textbook resale and verified A+ course summaries for students at BOUESTI and surrounding institutions.',
    logo_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    profile_thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    campus_location: 'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
    campuses_served: [
      'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
      'Ekiti State University (EKSU)'
    ],
    pickup_point: 'Administrative Block Concourse, Ikere-Ekiti',
    rating: 4.7,
    reviews_count: 41,
    total_sales: 110,
    status: 'active',
    created_at: '2025-07-28T11:00:00Z',
    whatsapp_url: 'https://wa.me/2348032348901',
    verified_student: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-tech-1',
    seller_id: 'user-seller-1',
    store_id: 'store-ays-tech',
    store_name: "Ay's Tech Hub",
    name: 'Compact Wireless Mechanical Keyboard (Quiet Switches)',
    slug: 'compact-wireless-mechanical-keyboard',
    description: 'Silent yellow switches for library and hostel study sessions. Dual-mode Bluetooth and 2.4GHz with long-lasting rechargeable battery.',
    price: 38500,
    discount_price: 32000,
    category_id: 'cat-tech',
    category_name: 'Tech & Gadgets',
    images: [
      '/src/assets/images/product_tech_gadgets_1791134311823.jpg',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 8,
    status: 'published',
    is_featured: true,
    rating: 4.9,
    reviews_count: 24,
    condition: 'Brand New',
    campus_name: 'Ekiti State University (EKSU)',
    created_at: '2025-09-02T10:00:00Z',
    updated_at: '2025-09-15T12:00:00Z'
  },
  {
    id: 'prod-tech-2',
    seller_id: 'user-seller-1',
    store_id: 'store-ays-tech',
    store_name: "Ay's Tech Hub",
    name: '65W GaN 3-Port Fast Charger & 2m Braided Cable',
    slug: '65w-gan-fast-charger',
    description: 'Fast-charges laptops, Android phones, and iPhones simultaneously with surge protection for campus hostels.',
    price: 18500,
    discount_price: 15000,
    category_id: 'cat-tech',
    category_name: 'Tech & Gadgets',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 15,
    status: 'published',
    is_featured: false,
    rating: 4.8,
    reviews_count: 19,
    condition: 'Brand New',
    campus_name: 'Ekiti State University (EKSU)',
    created_at: '2025-09-05T14:20:00Z',
    updated_at: '2025-09-12T09:00:00Z'
  },
  {
    id: 'prod-fashion-1',
    seller_id: 'user-seller-2',
    store_id: 'store-campus-fashion',
    store_name: 'Ekiti Thrift & Vintage Hub',
    name: 'Vintage Collegiate Corduroy Jacket & Canvas Tote',
    slug: 'vintage-collegiate-corduroy-jacket',
    description: 'Carefully authenticated vintage corduroy jacket in forest green with warm quilted lining. Paired with a heavy 16oz organic cotton campus tote bag.',
    price: 25000,
    category_id: 'cat-fashion',
    category_name: 'Vintage & Apparel',
    images: [
      '/src/assets/images/product_vintage_thrift_1791134323150.jpg',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 3,
    status: 'published',
    is_featured: true,
    rating: 5.0,
    reviews_count: 14,
    condition: 'Like New',
    campus_name: 'Afe Babalola University (ABUAD)',
    created_at: '2025-09-08T11:00:00Z',
    updated_at: '2025-09-18T16:00:00Z'
  },
  {
    id: 'prod-food-1',
    seller_id: 'user-seller-3',
    store_id: 'store-student-bites',
    store_name: 'Oye Treats & Pastries',
    name: 'Fresh Dorm-Baked Cookie & Meat Pie Pack (Box of 6)',
    slug: 'fresh-cookie-meatpie-box',
    description: 'Freshly prepared crispy meat pies and chocolate chunk cookies baked fresh every morning in Oye-Ekiti.',
    price: 6500,
    discount_price: 5500,
    category_id: 'cat-food',
    category_name: 'Campus Bites & Snacks',
    images: [
      '/src/assets/images/product_artisan_bites_1791134333788.jpg',
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 12,
    status: 'published',
    is_featured: true,
    rating: 5.0,
    reviews_count: 38,
    condition: 'Handmade / Custom',
    campus_name: 'Federal University Oye-Ekiti (FUOYE)',
    created_at: '2025-09-10T08:00:00Z',
    updated_at: '2025-09-19T07:30:00Z'
  },
  {
    id: 'prod-supplies-1',
    seller_id: 'user-seller-4',
    store_id: 'store-book-hub',
    store_name: 'Ikere Campus BookExchange',
    name: 'Rechargeable LED Desk Study Lamp & Semester Planner',
    slug: 'rechargeable-desk-lamp-planner',
    description: 'Long-lasting rechargeable lamp with 3 light levels and flexible neck. Essential for reading through night outages in campus hostels.',
    price: 14000,
    discount_price: 11500,
    category_id: 'cat-supplies',
    category_name: 'Hostel & Study Supplies',
    images: [
      '/src/assets/images/product_notes_supplies_1791134345274.jpg',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 10,
    status: 'published',
    is_featured: true,
    rating: 4.8,
    reviews_count: 21,
    condition: 'Brand New',
    campus_name: 'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
    created_at: '2025-09-11T13:40:00Z',
    updated_at: '2025-09-16T15:10:00Z'
  },
  {
    id: 'prod-books-1',
    seller_id: 'user-seller-4',
    store_id: 'store-book-hub',
    store_name: 'Ikere Campus BookExchange',
    name: 'CSC 201 Data Structures & Algorithms Companion (With Solution Deck)',
    slug: 'csc201-data-structures-notes',
    description: 'Course companion guide with past exam questions, code solutions, and handwritten summaries from top performers.',
    price: 6000,
    discount_price: 4500,
    category_id: 'cat-books',
    category_name: 'Books & Course Materials',
    images: [
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 4,
    status: 'published',
    is_featured: false,
    rating: 4.9,
    reviews_count: 17,
    condition: 'Gently Used',
    campus_name: 'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
    created_at: '2025-09-12T16:00:00Z',
    updated_at: '2025-09-17T11:00:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-tech-1',
    product_name: 'Compact Wireless Mechanical Keyboard (Quiet Switches)',
    store_id: 'store-ays-tech',
    user_id: 'user-customer-1',
    user_name: 'Maya Adebayo',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    comment: 'Met Ayomide right at the EKSU SUB building between lectures. The keyboard is so smooth and quiet, perfect for reading in the main library without disturbing anyone!',
    verified_purchase: true,
    created_at: '2025-09-14T15:20:00Z',
    status: 'approved'
  },
  {
    id: 'rev-2',
    product_id: 'prod-food-1',
    product_name: 'Fresh Dorm-Baked Cookie & Meat Pie Pack (Box of 6)',
    store_id: 'store-student-bites',
    user_id: 'user-customer-1',
    user_name: 'Maya Adebayo',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    comment: 'These pies are delicious! Arrived warm at the library quad. 10/10 student hustle!',
    verified_purchase: true,
    created_at: '2025-09-18T18:00:00Z',
    status: 'approved'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'CM-8921',
    customer_id: 'user-customer-1',
    customer_name: 'Maya Adebayo',
    customer_email: 'maya.buyer@eksu.edu.ng',
    delivery_info: {
      student_name: 'Maya Adebayo',
      student_email: 'maya.buyer@eksu.edu.ng',
      student_id: 'EKSU/2024/8842',
      phone: '+2348032348901',
      campus: 'Ekiti State University (EKSU)',
      delivery_type: 'campus_dorm',
      location_detail: 'Hostel Block B, Room 14',
      notes: 'Call on arrival at the gate'
    },
    items: [
      {
        product_id: 'prod-tech-1',
        store_id: 'store-ays-tech',
        store_name: "Ay's Tech Hub",
        product_name: 'Compact Wireless Mechanical Keyboard (Quiet Switches)',
        price: 32000,
        quantity: 1,
        image_url: '/src/assets/images/product_tech_gadgets_1791134311823.jpg'
      }
    ],
    subtotal: 32000,
    discount_amount: 0,
    delivery_fee: 0,
    total_amount: 32000,
    payment_method: 'campus_pay',
    payment_status: 'paid',
    order_status: 'delivered',
    created_at: '2025-09-13T14:10:00Z',
    updated_at: '2025-09-14T11:00:00Z'
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    author_id: 'user-author-1',
    author_name: 'David Oladele',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    author_role: 'FUOYE Campus Journalist & Student Founder',
    title: 'From EKSU Quad to ₦1.2M/Month: Inside the Rise of Ay’s Tech Hub',
    slug: 'from-dorm-to-tech-hub-founder',
    summary: 'How one engineering undergraduate transformed a test multimeter and passion for reliable electronics into a cross-campus student brand across Ekiti State.',
    content: `When Ayomide Bello began studying at Ekiti State University, he noticed peers frequently struggling with substandard chargers and power cables that burned out after two weeks.

Equipped with an engineering test kit and a focus on component durability, he started sourcing certified GaN adapters and rechargeable study lights for classmates in Ado-Ekiti.

"At first, it was just helping friends in my department," Ayomide recounts. "Then orders started coming in from FUOYE in Oye-Ekiti and ABUAD. CampusMart gave me the infrastructure: verified student trust, direct campus handoffs, and instant WhatsApp customer links. Instead of worrying about interstate delivery fees, we meet safely right at campus pickup points."`,
    category: 'Founder Spotlights',
    cover_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    read_time: '4 min read',
    views: 482,
    likes: 67,
    created_at: '2025-09-16T10:00:00Z'
  },
  {
    id: 'post-2',
    author_id: 'user-author-1',
    author_name: 'David Oladele',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    author_role: 'FUOYE Campus Journalist',
    title: 'Zero Delivery Fees: How Physical Campus Density Powers Student Trade in Ekiti',
    slug: 'zero-delivery-fees-campus-logistics',
    summary: 'Why designated campus pickup points outperform long-distance shipping: student sellers eliminate logistics overhead, prevent fraud, and build peer trust.',
    content: `Traditional e-commerce faces steep delivery fees and multi-day waiting periods. For students situated within concentrated academic corridors like EKSU, FUOYE, and ABUAD, campus density offers the ultimate advantage.

By establishing recognized meeting hubs such as the Student Union Building (SUB) or Faculty of Science Foyer, student entrepreneurs deliver same-day orders with zero delivery surcharge.`,
    category: 'Business Guides',
    cover_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    read_time: '3 min read',
    views: 310,
    likes: 42,
    created_at: '2025-09-12T14:30:00Z'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    buyer_id: 'user-customer-1',
    buyer_name: 'Maya Adebayo',
    seller_id: 'user-seller-1',
    seller_name: 'Ayomide Bello',
    store_id: 'store-ays-tech',
    store_name: "Ay's Tech Hub",
    product_id: 'prod-tech-1',
    product_name: 'Compact Wireless Mechanical Keyboard (Quiet Switches)',
    product_image: '/src/assets/images/product_tech_gadgets_1791134311823.jpg',
    last_message: 'Awesome! I am at the EKSU SUB building now if you want to test the switches.',
    last_updated: '2025-09-13T13:45:00Z',
    unread_by_buyer: false,
    unread_by_seller: false,
    messages: [
      {
        id: 'msg-1',
        sender_id: 'user-customer-1',
        sender_name: 'Maya Adebayo',
        sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        text: 'Hi Ayomide! Does the mechanical keyboard work smoothly with Mac and Windows?',
        timestamp: '2025-09-13T13:30:00Z',
        is_read: true
      },
      {
        id: 'msg-2',
        sender_id: 'user-seller-1',
        sender_name: 'Ayomide Bello',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        text: 'Hey Maya! Yes, it supports both effortlessly with a switch at the back.',
        timestamp: '2025-09-13T13:35:00Z',
        is_read: true
      },
      {
        id: 'msg-3',
        sender_id: 'user-seller-1',
        sender_name: 'Ayomide Bello',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        text: 'Awesome! I am at the EKSU SUB building now if you want to test the switches.',
        timestamp: '2025-09-13T13:45:00Z',
        is_read: true
      }
    ]
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    reporter_id: 'user-customer-1',
    reporter_name: 'Maya Adebayo',
    target_type: 'product',
    target_id: 'prod-flagged-item-1',
    target_name: 'Unauthorized Concert Pass',
    reason: 'Policy Violation',
    details: 'User attempting to resell unofficial wristbands without verification.',
    status: 'pending',
    created_at: '2025-09-18T16:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'user-customer-1',
    title: 'Order Delivered! 📦',
    message: 'Your order CM-8921 has been marked as delivered by Ay\'s Tech Hub.',
    type: 'order',
    is_read: false,
    link_tab: 'orders',
    created_at: '2025-09-14T11:00:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'user-seller-1',
    title: 'New Student Order! 🚀',
    message: 'Maya Adebayo just placed an order for Compact Wireless Mechanical Keyboard (#CM-8921).',
    type: 'order',
    is_read: false,
    link_tab: 'orders',
    created_at: '2025-09-13T14:10:00Z'
  }
];

// Local Storage Helper Functions
const STORAGE_KEYS = {
  USERS: 'campusmart_users_v2',
  STORES: 'campusmart_stores_v2',
  PRODUCTS: 'campusmart_products_v2',
  CATEGORIES: 'campusmart_categories_v2',
  ORDERS: 'campusmart_orders_v2',
  REVIEWS: 'campusmart_reviews_v2',
  CONVERSATIONS: 'campusmart_conversations_v2',
  NOTIFICATIONS: 'campusmart_notifications_v2',
  REPORTS: 'campusmart_reports_v2',
  BLOGS: 'campusmart_blogs_v2',
  ACTIVE_CAMPUS: 'campusmart_selected_campus_v2'
};

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  getUsers: (): UserProfile[] => getStoredItem(STORAGE_KEYS.USERS, DEMO_USERS),
  setUsers: (users: UserProfile[]) => setStoredItem(STORAGE_KEYS.USERS, users),

  getStores: (): Store[] => {
    const raw = getStoredItem(STORAGE_KEYS.STORES, INITIAL_STORES);
    // Sanitize any stored stores to ensure valid Ekiti campus locations
    return raw.map((s) => ({
      ...s,
      campus_location: sanitizeCampus(s.campus_location),
      campuses_served: s.campuses_served && s.campuses_served.length > 0
        ? s.campuses_served.map(sanitizeCampus)
        : [sanitizeCampus(s.campus_location)]
    }));
  },
  setStores: (stores: Store[]) => setStoredItem(STORAGE_KEYS.STORES, stores),

  getProducts: (): Product[] => {
    const raw = getStoredItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return raw.map((p) => ({
      ...p,
      campus_name: sanitizeCampus(p.campus_name)
    }));
  },
  setProducts: (products: Product[]) => setStoredItem(STORAGE_KEYS.PRODUCTS, products),

  getCategories: (): Category[] => getStoredItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
  setCategories: (cats: Category[]) => setStoredItem(STORAGE_KEYS.CATEGORIES, cats),

  getOrders: (): Order[] => getStoredItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
  setOrders: (orders: Order[]) => setStoredItem(STORAGE_KEYS.ORDERS, orders),

  getReviews: (): Review[] => getStoredItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS),
  setReviews: (reviews: Review[]) => setStoredItem(STORAGE_KEYS.REVIEWS, reviews),

  getConversations: (): Conversation[] => getStoredItem(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS),
  setConversations: (convs: Conversation[]) => setStoredItem(STORAGE_KEYS.CONVERSATIONS, convs),

  getNotifications: (): NotificationItem[] => getStoredItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  setNotifications: (notifs: NotificationItem[]) => setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifs),

  getReports: (): ReportItem[] => getStoredItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS),
  setReports: (reports: ReportItem[]) => setStoredItem(STORAGE_KEYS.REPORTS, reports),

  getBlogPosts: (): BlogPost[] => getStoredItem(STORAGE_KEYS.BLOGS, INITIAL_BLOG_POSTS),
  setBlogPosts: (posts: BlogPost[]) => setStoredItem(STORAGE_KEYS.BLOGS, posts),

  getSelectedCampus: (): string => {
    const stored = getStoredItem(STORAGE_KEYS.ACTIVE_CAMPUS, DEFAULT_CAMPUS);
    return isValidCampus(stored) ? stored : DEFAULT_CAMPUS;
  },
  setSelectedCampus: (campus: string) => {
    const sanitized = sanitizeCampus(campus);
    setStoredItem(STORAGE_KEYS.ACTIVE_CAMPUS, sanitized);
  },

  resetToDefault: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
};
