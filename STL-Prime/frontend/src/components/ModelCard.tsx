import React from 'react';
import { Download, ShoppingCart, Star, Heart, Box } from 'lucide-react';

interface ModelCardProps {
    title: string;
    price: number;
    imageUrl: string;
    isFree?: boolean;
    author?: string;
    downloads?: string;
    likes?: number;
    format?: string;
}

export default function ModelCard({
    title,
    price,
    imageUrl,
    isFree = false,
    author = '@Maker',
    downloads = '1.2k',
    likes = 120,
    format = 'STL'
}: ModelCardProps) {
    return (
        <div className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-df-blue/50 hover:shadow-xl transition-all duration-300">
            {/* Imagem do Modelo */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                />
                {/* Etiqueta de Formato (3MF/STL) */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm text-gray-800">
                    {format}
                </div>
                {/* Badge Grátis */}
                {isFree && (
                    <div className="absolute top-4 left-16 bg-[#10B981] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white">
                        Grátis
                    </div>
                )}
                {/* Botão de Gosto Rápido */}
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0">
                    <Heart size={20} />
                </button>
            </div>

            {/* Informação do Modelo */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="mb-4">
                    <h3 className="text-lg font-bold mb-1 line-clamp-1 group-hover:text-df-blue transition-colors cursor-pointer text-df-dark">
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-800">
                        {author}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-gray-500 font-bold text-sm">
                            <Download size={16} /> {downloads}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 font-bold text-sm">
                            <Heart size={16} /> {likes}
                        </div>
                    </div>

                    <span className={`font-black text-lg ${isFree ? 'text-[#10B981]' : 'text-df-dark'}`}>
                        {isFree ? 'Grátis' : `€${price.toFixed(2)}`}
                    </span>
                </div>
            </div>
        </div>
    );
}
