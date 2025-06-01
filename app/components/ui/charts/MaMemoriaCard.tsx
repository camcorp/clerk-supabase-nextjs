'use client';

import React from 'react';

interface MemoriaSection {
  title: string;
  items: string[];
}

interface MaMemoriaCardProps {
  title: string;
  sections: MemoriaSection[];
}

export default function MaMemoriaCard({ title, sections }: MaMemoriaCardProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Estructura de la memoria anual de corredores de seguros
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={`${sectionIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
              <dt className="text-sm font-medium text-gray-500">{section.title}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">{item}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}