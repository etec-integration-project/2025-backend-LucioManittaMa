import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const offers = [
  {
    id: 1,
    title: "Nike Air Jordan 1 High OG",
    price: 179.99,
    originalPrice: 199.99,
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    discount: "20%"
  },
  {
    id: 2,
    title: "Adidas Yeezy Boost 350",
    price: 219.99,
    originalPrice: 299.99,
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    discount: "25%"
  },
  {
    id: 3,
    title: "Nike Air Max 90",
    price: 129.99,
    originalPrice: 159.99,
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    discount: "15%"
  }
];

export default function SpecialOffers() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Special Offers</h2>
        <Slider {...settings}>
          {offers.map((offer) => (
            <div key={offer.id} className="px-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full">
                    Save {offer.discount}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-green-600">
                      ${offer.price}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${offer.originalPrice}
                    </span>
                  </div>
                  <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}