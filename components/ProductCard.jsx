import React from 'react';

export default function ProductCard({product}){
  return (
    <div className="border rounded p-3 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-500">{product.brand}</div>
          <div className="font-semibold">{product.model}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">₹{product.price}</div>
          <div className="text-xs text-gray-500">{product.storage}GB • {product.ram}GB</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-700">{product.display}</div>
      <div className="mt-1 text-xs text-gray-700">Camera: {product.camera}</div>
      <div className="mt-1 text-xs text-gray-500">{product.notes}</div>
    </div>
  );
}