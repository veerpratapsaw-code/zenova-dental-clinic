export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  category: string;
  readTime: string;
  imageUrl: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'the-complete-guide-to-invisible-aligners',
    title: 'The Complete Guide to Invisible Aligners',
    excerpt: 'Everything you need to know about straightening your teeth invisibly, from cost to timeline.',
    author: {
      name: 'Dr. Sarah Chen',
      role: 'Lead Orthodontist',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100'
    },
    date: 'May 12, 2026',
    category: 'Orthodontics',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Why Choose Invisible Aligners?</h2>
      <p>Gone are the days when straightening your teeth meant years of metallic brackets and wires. Invisible aligners have revolutionized orthodontics, offering a discreet, comfortable, and highly effective way to achieve your dream smile.</p>
      
      <h3>1. Unmatched Aesthetics</h3>
      <p>The primary advantage is obvious: they are virtually invisible. Whether you are in a professional meeting or taking photos with friends, most people won't even realize you are undergoing orthodontic treatment.</p>
      
      <h3>2. Dietary Freedom</h3>
      <p>Unlike traditional braces, aligners are completely removable. This means you don't have to give up your favorite foods like apples, popcorn, or sticky candies. Simply take out your trays, enjoy your meal, brush your teeth, and pop them back in.</p>
      
      <h3>3. Better Oral Hygiene</h3>
      <p>Because you remove the aligners to brush and floss, maintaining your oral health is significantly easier. There are no wires to navigate around, reducing the risk of plaque buildup and gum disease during treatment.</p>

      <h2>The Process: What to Expect</h2>
      <p>Your journey begins with a 3D digital scan of your teeth. We use this scan to map out a precise, custom treatment plan. You will receive a series of custom-made trays, wearing each set for about 1-2 weeks before moving to the next. Slowly and gently, your teeth will shift into their perfect positions.</p>

      <blockquote>
        "Invisible aligners aren't just about aesthetics; they offer a healthier and more comfortable journey to a perfect smile." — Dr. Sarah Chen
      </blockquote>
      
      <p>If you're considering invisible aligners, schedule a consultation with our clinic today to see if you are a candidate!</p>
    `
  },
  {
    id: '2',
    slug: '5-signs-you-need-a-root-canal',
    title: '5 Signs You Might Need a Root Canal',
    excerpt: 'Don\'t ignore dental pain. Learn the top 5 warning signs that indicate you might need endodontic therapy.',
    author: {
      name: 'Dr. Michael Roberts',
      role: 'Endodontic Specialist',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100'
    },
    date: 'April 28, 2026',
    category: 'Endodontics',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fea5ce5146f2?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Don't Fear the Root Canal</h2>
      <p>Root canals have a bad reputation, but with modern anesthetics and techniques, they are no more painful than getting a standard filling. More importantly, a root canal saves your natural tooth from extraction. Here are 5 signs you might need one.</p>
      
      <h3>1. Persistent, Throbbing Pain</h3>
      <p>If you experience continuous, deep pain in a tooth that doesn't go away, or pain that radiates to your jaw, face, or other teeth, it could be a sign of nerve damage or infection deep within the tooth pulp.</p>
      
      <h3>2. Sensitivity to Heat and Cold</h3>
      <p>Does your tooth ache when you drink hot coffee or eat ice cream? If that pain lingers long after the hot or cold substance is gone, it indicates that the nerves and blood vessels in your tooth might be infected or damaged.</p>
      
      <h3>3. Swollen Gums</h3>
      <p>Swollen, tender, or darkened gums near the painful tooth can be a sign of an abscess (a pocket of pus caused by an infection). Sometimes, you might even notice a small pimple on the gumline.</p>

      <h3>4. Tooth Discoloration</h3>
      <p>If your tooth begins to look dark or grayish, it could mean the pulp inside has died due to trauma or internal decay.</p>

      <h3>5. Pain When Chewing</h3>
      <p>Severe pain when you apply pressure to the tooth, such as when biting or chewing food, is a classic indicator that the root is inflamed and requires treatment.</p>

      <h2>Act Quickly</h2>
      <p>If you are experiencing any of these symptoms, do not wait. The longer you put off treatment, the higher the risk of losing the tooth entirely or the infection spreading. Contact For Your Dentist immediately for an emergency assessment.</p>
    `
  },
  {
    id: '3',
    slug: 'the-future-of-cosmetic-dentistry',
    title: 'The Future of Cosmetic Dentistry: What to Expect in 2026',
    excerpt: 'From 3D printed veneers to AI smile design, explore the cutting-edge technologies shaping modern dentistry.',
    author: {
      name: 'Dr. Emily Watson',
      role: 'Cosmetic Dentist',
      avatar: 'https://images.unsplash.com/photo-1594824436998-058d01f6cefac?auto=format&fit=crop&q=80&w=100'
    },
    date: 'April 15, 2026',
    category: 'Technology',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>A New Era of Smile Design</h2>
      <p>The field of cosmetic dentistry is evolving at a breakneck pace. Technologies that seemed like science fiction just a decade ago are now daily realities in elite clinics like For Your Dentist.</p>
      
      <h3>AI-Powered Smile Design</h3>
      <p>Artificial Intelligence is now actively used to design the perfect smile tailored to your facial structure. By analyzing thousands of data points on your face, AI algorithms can predict exactly how different veneer shapes or orthodontic adjustments will look, allowing you to preview your new smile in hyper-realistic 3D before treatment even begins.</p>
      
      <h3>3D Printed Dental Implants & Veneers</h3>
      <p>3D printing has completely disrupted dental laboratories. We can now print highly durable, incredibly realistic crowns and veneers in-house in a matter of hours, significantly reducing wait times and ensuring a micro-precise fit.</p>
      
      <h3>Laser Dentistry</h3>
      <p>Lasers have replaced the dreaded drill in many procedures. They offer painless contouring of the gums, precise removal of decay, and faster teeth whitening. Because lasers cauterize as they work, healing times are drastically reduced.</p>

      <h2>The For Your Dentist Difference</h2>
      <p>At For Your Dentist, we pride ourselves on staying at the absolute forefront of these technological advancements. By combining elite medical expertise with next-generation technology, we ensure your cosmetic journey is faster, safer, and more stunning than ever before.</p>
    `
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};
