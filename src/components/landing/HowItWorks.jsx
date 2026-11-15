import React from 'react';
import { UserPlus, FileEdit, Users2, ArrowRight } from 'lucide-react';

export default function HowItWorks({ onOpenAuth }) {
  const steps = [
    {
      step: '01',
      icon: UserPlus,
      title: 'Create Your Account',
      description:
        'Claim your unique writer handle, customize your author bio, and join a supportive network of passionate creators in seconds.',
      previewText: '@yourname · Author Profile',
    },
    {
      step: '02',
      icon: FileEdit,
      title: 'Publish Your Stories',
      description:
        'Compose your ideas using our minimalist editorial editor. Add cover images, select categories, save drafts, and publish whenever you are ready.',
      previewText: 'Draft Autosaved · Markdown Supported',
    },
    {
      step: '03',
      icon: Users2,
      title: 'Connect With Readers',
      description:
        'Reach readers directly in their chronological feeds. Receive feedback, foster meaningful conversations, and expand your subscriber audience.',
      previewText: 'Live Comments · Follower Notifications',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-stone-50/70 border-t border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
            Simple & Transparent
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            How WriteSpace Works
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            From your very first draft to a dedicated community of subscribers—sharing your voice has never been this seamless.
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-2xl p-8 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Step Number & Icon Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-editorial text-3xl font-extrabold text-stone-300">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-editorial text-xl font-bold text-stone-900 mb-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Sub-label Preview pill */}
                <div className="pt-4 border-t border-stone-100">
                  <span className="inline-block text-[11px] font-semibold text-stone-500 bg-stone-100/80 px-2.5 py-1 rounded-md">
                    {item.previewText}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
