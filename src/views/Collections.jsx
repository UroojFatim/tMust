"use client";

import { motion } from "framer-motion";

export default function Collections() {
  const items = [
    { title: "Luxury", image: "/collections/luxury.png" },
    { title: "Semi Formal", image: "/collections/riwayat.png" },
    { title: "Ethnic Collection", image: "/collections/satrangi.png" },
    { title: "Smart Casual Collection", image: "/collections/satrangi.png" },
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}   // 🔁 animate every time
          className="text-3xl md:text-4xl font-semibold mb-12"
        >
          Collections
        </motion.h2>

        {/* Circles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 place-items-center">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.15, // stagger
              }}
              viewport={{ once: false, amount: 0.3 }}   // 🔁 animate every time
              className="flex flex-col items-center"
            >
              {/* Circle Image */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden border border-gray-200 shadow-md"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Title */}
              <p className="mt-4 text-sm md:text-base font-medium">
                {item.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
