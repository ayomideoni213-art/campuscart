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

export const CAMPUS_OPTIONS: CampusOption[] = [
  {
    id: 'central-uni',
    name: 'Metropolitan Central University',
    short_code: 'MCU',
    pickup_hubs: ['Student Union Ground Floor', 'North Quad Pavilion', 'Main Library Plaza', 'East Residential Hall']
  },
  {
    id: 'tech-institute',
    name: 'State Institute of Technology',
    short_code: 'SIT',
    pickup_hubs: ['Engineering Atrium', 'Student Commons Locker Hub', 'West Dorm Courtyard']
  },
  {
    id: 'coastal-college',
    name: 'Coastal University Campus',
    short_code: 'CUC',
    pickup_hubs: ['Bay Center', 'South Commons', 'Academic Tower Lobby']
  }
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-customer-1',
    email: 'maya.buyer@campus.edu',
    full_name: 'Maya Lin',
    role: 'customer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Metropolitan Central University',
    student_id: 'MCU-2024-8842',
    phone: '+1 (555) 234-8901',
    bio: 'Junior studying Architecture. Plant lover and avid campus thrifter.',
    created_at: '2025-09-12T10:00:00Z'
  },
  {
    id: 'user-seller-1',
    email: 'ayomide.tech@campus.edu',
    full_name: 'Ayomide Bello',
    role: 'seller',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Metropolitan Central University',
    student_id: 'MCU-2023-4109',
    phone: '+1 (555) 345-6789',
    bio: 'Senior Electrical Engineering major. Building Ay\'s Tech to bring students reliable, affordable tech gear.',
    created_at: '2025-08-20T14:30:00Z'
  },
  {
    id: 'user-editor-1',
    email: 'sarah.editor@campus.edu',
    full_name: 'Sarah Jenkins',
    role: 'editor',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Metropolitan Central University',
    student_id: 'MCU-2023-7721',
    phone: '+1 (555) 456-7890',
    bio: 'Editor & Student Council Liaison for marketplace safety and quality standards.',
    created_at: '2025-07-15T09:00:00Z'
  },
  {
    id: 'user-author-1',
    email: 'david.author@campus.edu',
    full_name: 'David Kim',
    role: 'author',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Metropolitan Central University',
    student_id: 'MCU-2024-1188',
    phone: '+1 (555) 567-8901',
    bio: 'Campus Journalist & Business Fellow. Writing about student founders, hustle culture, and smart budgeting.',
    created_at: '2025-08-01T11:20:00Z'
  },
  {
    id: 'user-admin-1',
    email: 'admin@campusmart.edu',
    full_name: 'Alex Rivera',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    campus_name: 'Metropolitan Central University',
    student_id: 'MCU-ADM-001',
    phone: '+1 (555) 999-0011',
    bio: 'Platform Co-Founder and Administrator. Ensuring fair and safe student trade.',
    created_at: '2025-06-01T08:00:00Z'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tech',
    name: 'Tech & Gadgets',
    slug: 'tech-gadgets',
    description: 'Cables, keyboards, chargers, dorm electronics & audio equipment.',
    icon_name: 'Laptop',
    product_count: 8
  },
  {
    id: 'cat-fashion',
    name: 'Vintage & Apparel',
    slug: 'vintage-apparel',
    description: 'Curated thrift finds, student-made streetwear, hoodies, and totes.',
    icon_name: 'Shirt',
    product_count: 6
  },
  {
    id: 'cat-food',
    name: 'Campus Bites & Bakery',
    slug: 'campus-bites',
    description: 'Homemade matcha cookies, artisan brownies, and meal prep packages.',
    icon_name: 'Utensils',
    product_count: 5
  },
  {
    id: 'cat-books',
    name: 'Books & Course Notes',
    slug: 'books-notes',
    description: 'Textbooks, annotated study guides, lab manuals & exam prep decks.',
    icon_name: 'BookOpen',
    product_count: 7
  },
  {
    id: 'cat-supplies',
    name: 'Dorm & School Supplies',
    slug: 'dorm-supplies',
    description: 'Stationery, desk organizers, lighting, planners, and room decor.',
    icon_name: 'Pencil',
    product_count: 4
  },
  {
    id: 'cat-services',
    name: 'Student Services',
    slug: 'student-services',
    description: 'Peer tutoring, dorm room photography, graphic design, and bicycle tuning.',
    icon_name: 'Sparkles',
    product_count: 3
  }
];

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-ays-tech',
    seller_id: 'user-seller-1',
    name: "Ay's Tech Store",
    slug: 'ays-tech',
    tagline: 'Affordable gadgets & verified cables for student dorm life.',
    description: 'Founded by senior Electrical Engineering student Ayomide Bello. We test and curate durable peripherals, custom mechanical keyboards, high-wattage GaN chargers, and braided cables guaranteed to survive your finals sprint.',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    campus_location: 'Metropolitan Central University',
    pickup_point: 'Engineering Atrium / North Quad Table B3',
    rating: 4.9,
    reviews_count: 48,
    total_sales: 142,
    status: 'active',
    created_at: '2025-08-25T12:00:00Z',
    instagram_handle: '@aystech_mcu',
    verified_student: true
  },
  {
    id: 'store-campus-fashion',
    seller_id: 'user-seller-2',
    name: 'Campus Threads & Vintage',
    slug: 'campus-threads',
    tagline: 'Sustainable college streetwear & one-of-a-kind upcycled pieces.',
    description: 'Run by sophomore fine arts student Chloe. We curate 90s collegiate jackets, rework vintage crewnecks, and hand-screenprint heavyweight canvas totes using water-based inks.',
    logo_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    campus_location: 'Metropolitan Central University',
    pickup_point: 'Student Union Plaza Entrance',
    rating: 4.8,
    reviews_count: 34,
    total_sales: 89,
    status: 'active',
    created_at: '2025-09-01T10:00:00Z',
    instagram_handle: '@campusthreads',
    verified_student: true
  },
  {
    id: 'store-student-bites',
    seller_id: 'user-seller-3',
    name: 'Student Bites Bakery',
    slug: 'student-bites',
    tagline: 'Small-batch artisanal baked goods made fresh in dorm kitchens.',
    description: 'Fresh cookies, brownies, and savory hand pies baked in small batches before every morning lecture. Order ahead for study group treats or exam week fuel.',
    logo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
    campus_location: 'Metropolitan Central University',
    pickup_point: 'Campus Library Coffee Kiosk Area',
    rating: 5.0,
    reviews_count: 62,
    total_sales: 215,
    status: 'active',
    created_at: '2025-08-10T16:00:00Z',
    instagram_handle: '@studentbites_fresh',
    verified_student: true
  },
  {
    id: 'store-book-hub',
    seller_id: 'user-seller-4',
    name: 'MCU BookHub & Notes',
    slug: 'bookhub-notes',
    tagline: 'Peer-to-peer textbook resale and verified A+ course summaries.',
    description: 'Stop paying $250 for semester textbooks. BookHub connects former students with current enrollments for 50-80% off retail, including printed study cheat-sheets.',
    logo_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    campus_location: 'Metropolitan Central University',
    pickup_point: 'East Residential Hall Study Lounge',
    rating: 4.7,
    reviews_count: 41,
    total_sales: 110,
    status: 'active',
    created_at: '2025-07-28T11:00:00Z',
    verified_student: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-tech-1',
    seller_id: 'user-seller-1',
    store_id: 'store-ays-tech',
    store_name: "Ay's Tech Store",
    name: 'Custom Compact Mechanical Keyboard (Hot-Swap)',
    slug: 'custom-compact-mechanical-keyboard',
    description: 'Lubed yellow linear switches for quiet, satisfying typing in campus libraries and dorms. Includes detachable braided coiled USB-C cable and custom dye-sub PBT keycaps.',
    price: 49.00,
    discount_price: 39.99,
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
    campus_name: 'Metropolitan Central University',
    created_at: '2025-09-02T10:00:00Z',
    updated_at: '2025-09-15T12:00:00Z'
  },
  {
    id: 'prod-tech-2',
    seller_id: 'user-seller-1',
    store_id: 'store-ays-tech',
    store_name: "Ay's Tech Store",
    name: '65W GaN Fast Charger & 2m Braided Cable',
    slug: '65w-gan-fast-charger',
    description: 'Compact ultra-portable fast charger capable of charging your MacBook, iPad, and iPhone simultaneously. Includes rugged nylon braided cable.',
    price: 24.50,
    discount_price: 19.99,
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
    campus_name: 'Metropolitan Central University',
    created_at: '2025-09-05T14:20:00Z',
    updated_at: '2025-09-12T09:00:00Z'
  },
  {
    id: 'prod-fashion-1',
    seller_id: 'user-seller-2',
    store_id: 'store-campus-fashion',
    store_name: 'Campus Threads & Vintage',
    name: 'Vintage Collegiate Corduroy Jacket & Tote Set',
    slug: 'vintage-collegiate-corduroy-jacket',
    description: 'Carefully authenticated vintage corduroy jacket in forest green with warm quilted lining. Paired with a heavy 16oz organic cotton campus tote bag.',
    price: 45.00,
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
    campus_name: 'Metropolitan Central University',
    created_at: '2025-09-08T11:00:00Z',
    updated_at: '2025-09-18T16:00:00Z'
  },
  {
    id: 'prod-food-1',
    seller_id: 'user-seller-3',
    store_id: 'store-student-bites',
    store_name: 'Student Bites Bakery',
    name: 'Fresh Dorm-Baked Matcha White Choc Cookie Box (6pcs)',
    slug: 'fresh-matcha-cookie-box',
    description: 'Baked fresh every morning with authentic ceremonial grade Uji matcha, Belgian white chocolate chunks, and flakey sea salt. Packed in an eco-friendly gift box.',
    price: 14.00,
    discount_price: 12.00,
    category_id: 'cat-food',
    category_name: 'Campus Bites & Bakery',
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
    campus_name: 'Metropolitan Central University',
    created_at: '2025-09-10T08:00:00Z',
    updated_at: '2025-09-19T07:30:00Z'
  },
  {
    id: 'prod-supplies-1',
    seller_id: 'user-seller-4',
    store_id: 'store-book-hub',
    store_name: 'MCU BookHub & Notes',
    name: 'Hardcover Academic Daily Planner & Brass Pen Set',
    slug: 'hardcover-academic-planner-pen-set',
    description: 'Structured 12-month undated semester planner designed specifically for university coursework, assignment sprints, and exam milestones. Comes with brushed metallic ballpoint pen.',
    price: 22.00,
    discount_price: 18.50,
    category_id: 'cat-supplies',
    category_name: 'Dorm & School Supplies',
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
    campus_name: 'Metropolitan Central University',
    created_at: '2025-09-11T13:40:00Z',
    updated_at: '2025-09-16T15:10:00Z'
  },
  {
    id: 'prod-books-1',
    seller_id: 'user-seller-4',
    store_id: 'store-book-hub',
    store_name: 'MCU BookHub & Notes',
    name: 'CS201 Data Structures & Algorithms Companion (With Bound Notes)',
    slug: 'cs201-data-structures-notes',
    description: 'Complete syllabus textbook paired with handwritten, color-coded study notes from an A+ student. Covers binary search trees, graph algorithms, and dynamic programming walkthroughs.',
    price: 32.00,
    discount_price: 28.00,
    category_id: 'cat-books',
    category_name: 'Books & Course Notes',
    images: [
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 2,
    status: 'published',
    is_featured: false,
    rating: 4.9,
    reviews_count: 17,
    condition: 'Gently Used',
    campus_name: 'Metropolitan Central University',
    created_at: '2025-09-12T16:00:00Z',
    updated_at: '2025-09-17T11:00:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-tech-1',
    product_name: 'Custom Compact Mechanical Keyboard (Hot-Swap)',
    store_id: 'store-ays-tech',
    user_id: 'user-customer-1',
    user_name: 'Maya Lin',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    comment: 'Met Ayomide right at the North Quad table between classes. The keyboard is so smooth and remarkably quiet—I can actually type in the silent library zone without getting glared at!',
    verified_purchase: true,
    created_at: '2025-09-14T15:20:00Z',
    status: 'approved'
  },
  {
    id: 'rev-2',
    product_id: 'prod-food-1',
    product_name: 'Fresh Dorm-Baked Matcha White Choc Cookie Box (6pcs)',
    store_id: 'store-student-bites',
    user_id: 'user-customer-1',
    user_name: 'Maya Lin',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    comment: 'These cookies are dangerously good. The matcha is rich and authentic, and they arrived warm at the library desk. 10/10 student hustle!',
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
    customer_name: 'Maya Lin',
    customer_email: 'maya.buyer@campus.edu',
    delivery_info: {
      student_name: 'Maya Lin',
      student_email: 'maya.buyer@campus.edu',
      student_id: 'MCU-2024-8842',
      phone: '+1 (555) 234-8901',
      campus: 'Metropolitan Central University',
      delivery_type: 'campus_dorm',
      location_detail: 'East Residential Hall, Suite 304B',
      notes: 'Please drop at hall reception or text when outside'
    },
    items: [
      {
        product_id: 'prod-tech-1',
        store_id: 'store-ays-tech',
        store_name: "Ay's Tech Store",
        product_name: 'Custom Compact Mechanical Keyboard (Hot-Swap)',
        price: 39.99,
        quantity: 1,
        image_url: '/src/assets/images/product_tech_gadgets_1791134311823.jpg'
      }
    ],
    subtotal: 39.99,
    discount_amount: 0,
    delivery_fee: 0,
    total_amount: 39.99,
    payment_method: 'campus_pay',
    payment_status: 'paid',
    order_status: 'delivered',
    created_at: '2025-09-13T14:10:00Z',
    updated_at: '2025-09-14T11:00:00Z'
  },
  {
    id: 'ord-1002',
    order_number: 'CM-8994',
    customer_id: 'user-customer-1',
    customer_name: 'Maya Lin',
    customer_email: 'maya.buyer@campus.edu',
    delivery_info: {
      student_name: 'Maya Lin',
      student_email: 'maya.buyer@campus.edu',
      student_id: 'MCU-2024-8842',
      phone: '+1 (555) 234-8901',
      campus: 'Metropolitan Central University',
      delivery_type: 'library_desk',
      location_detail: 'Main Library 2nd Floor Quiet Cubicle #4',
      notes: 'Text upon arrival'
    },
    items: [
      {
        product_id: 'prod-food-1',
        store_id: 'store-student-bites',
        store_name: 'Student Bites Bakery',
        product_name: 'Fresh Dorm-Baked Matcha White Choc Cookie Box (6pcs)',
        price: 12.00,
        quantity: 1,
        image_url: '/src/assets/images/product_artisan_bites_1791134333788.jpg'
      }
    ],
    subtotal: 12.00,
    discount_amount: 0,
    delivery_fee: 0,
    total_amount: 12.00,
    payment_method: 'card',
    payment_status: 'paid',
    order_status: 'delivered',
    created_at: '2025-09-17T09:15:00Z',
    updated_at: '2025-09-17T11:45:00Z'
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    author_id: 'user-author-1',
    author_name: 'David Kim',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    author_role: 'Senior Business Fellow & Campus Journalist',
    title: 'From Dorm Room to $2,800/Month: Inside the Rise of Ay’s Tech Store',
    slug: 'from-dorm-to-tech-store-founder',
    summary: 'How one electrical engineering junior transformed an abandoned soldering iron into a campus-wide tech hardware brand without spending a dollar on paid ads.',
    content: `When Ayomide Bello arrived at Metropolitan Central University, he noticed classmates routinely overpaying for flimsy chargers and cheap cables that frayed before midterms. 

Equipped with an engineering hobbyist toolkit and a passion for component quality, he began hand-testing GaN adapters and custom mechanical keyboards in his dorm room. 

"At first, it was just helping people in my study group," Ayomide recounts. "Then word spread across the quad. CampusMart gave me the infrastructure: a verified storefront, campus-specific delivery hubs, and trust. Instead of meeting random strangers off Craigslist, students knew I was an active student living three buildings over."

In this feature, we break down three core rules every aspiring student entrepreneur must apply:
1. Solve an immediate peer friction point.
2. Leverage physical campus density for zero-cost logistics.
3. Treat your student identity as your superpower, not an amateur label.`,
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
    author_name: 'David Kim',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    author_role: 'Senior Business Fellow & Campus Journalist',
    title: 'The Smart Student Guide to Zero-Cost Campus Logistics & Meetups',
    slug: 'smart-student-campus-logistics',
    summary: 'Why campus pickup hubs are outperforming postal mail: how student sellers eliminate shipping fees, reduce carbon footprints, and build community trust.',
    content: `Traditional e-commerce is plagued by high delivery costs, damaged packaging, and multi-day shipping delays. For students living within a 15-minute walking perimeter, the campus ecosystem presents the world's most efficient logistics corridor.

By designating centralized pickup points like the Student Union Atrium or the Main Library Lobby, campus sellers offer same-day fulfillment with zero delivery overhead.

Here is how top student stores configure their pickup schedules to balance heavy class schedules with high sales volume...`,
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
    buyer_name: 'Maya Lin',
    seller_id: 'user-seller-1',
    seller_name: 'Ayomide Bello',
    store_id: 'store-ays-tech',
    store_name: "Ay's Tech Store",
    product_id: 'prod-tech-1',
    product_name: 'Custom Compact Mechanical Keyboard (Hot-Swap)',
    product_image: '/src/assets/images/product_tech_gadgets_1791134311823.jpg',
    last_message: 'Awesome! I am at the North Quad table right now if you want to test the key switches.',
    last_updated: '2025-09-13T13:45:00Z',
    unread_by_buyer: false,
    unread_by_seller: false,
    messages: [
      {
        id: 'msg-1',
        sender_id: 'user-customer-1',
        sender_name: 'Maya Lin',
        sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        text: 'Hi Ayomide! Is the mechanical keyboard Mac compatible out of the box?',
        timestamp: '2025-09-13T13:30:00Z',
        is_read: true
      },
      {
        id: 'msg-2',
        sender_id: 'user-seller-1',
        sender_name: 'Ayomide Bello',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        text: 'Hey Maya! Yes, it includes Command/Option keycaps in the box and has a physical Mac/Windows toggle switch on the back.',
        timestamp: '2025-09-13T13:35:00Z',
        is_read: true
      },
      {
        id: 'msg-3',
        sender_id: 'user-seller-1',
        sender_name: 'Ayomide Bello',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        text: 'Awesome! I am at the North Quad table right now if you want to test the key switches.',
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
    reporter_name: 'Maya Lin',
    target_type: 'product',
    target_id: 'prod-sample-suspicious',
    target_name: 'Unofficial Campus Football Tickets',
    reason: 'Restricted Item Policy',
    details: 'User is attempting to resell event wristbands above face value without campus verification.',
    status: 'pending',
    created_at: '2025-09-18T16:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'user-customer-1',
    title: 'Order Delivered! 📦',
    message: 'Your order CM-8921 has been marked as delivered by Ay\'s Tech Store.',
    type: 'order',
    is_read: false,
    link_tab: 'orders',
    created_at: '2025-09-14T11:00:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'user-seller-1',
    title: 'New Student Order! 🚀',
    message: 'Maya Lin just ordered Custom Compact Mechanical Keyboard (#CM-8921).',
    type: 'order',
    is_read: false,
    link_tab: 'orders',
    created_at: '2025-09-13T14:10:00Z'
  }
];

// Local Storage Helper Functions
const STORAGE_KEYS = {
  USERS: 'campusmart_users_v1',
  STORES: 'campusmart_stores_v1',
  PRODUCTS: 'campusmart_products_v1',
  CATEGORIES: 'campusmart_categories_v1',
  ORDERS: 'campusmart_orders_v1',
  REVIEWS: 'campusmart_reviews_v1',
  CONVERSATIONS: 'campusmart_conversations_v1',
  NOTIFICATIONS: 'campusmart_notifications_v1',
  REPORTS: 'campusmart_reports_v1',
  BLOGS: 'campusmart_blogs_v1',
  ACTIVE_CAMPUS: 'campusmart_selected_campus_v1'
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

  getStores: (): Store[] => getStoredItem(STORAGE_KEYS.STORES, INITIAL_STORES),
  setStores: (stores: Store[]) => setStoredItem(STORAGE_KEYS.STORES, stores),

  getProducts: (): Product[] => getStoredItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
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
    return getStoredItem(STORAGE_KEYS.ACTIVE_CAMPUS, 'Metropolitan Central University');
  },
  setSelectedCampus: (campus: string) => {
    setStoredItem(STORAGE_KEYS.ACTIVE_CAMPUS, campus);
  },

  resetToDefault: () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.STORES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.BLOGS);
  }
};
