'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { HomeSection } from './HomeSection';
import { AlertCircle, TrendingUp, CircleDollarSign } from 'lucide-react';

const DESCRIPTION =
  'Set prices, expected sales, COGS and business costs to see revenue and profitability calculations.';

const ADJUST_PERCENT = 5;
const DEFAULT_PRICE = 22;
const MOCK_INPUT_ID = 'home-price-mock';

function getPriceFeedback(price: number) {
  if (price === 0) {
    return {
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
      title: 'Set a price',
      color: 'text-blue-600 dark:text-blue-500',
      bgColor: 'bg-blue-500/10',
    };
  }
  if (price < 8) {
    return {
      icon: <TrendingUp className="h-5 w-5 text-yellow-500" />,
      title: 'Consider raising your price',
      color: 'text-yellow-600 dark:text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    };
  }
  if (price < 18) {
    return {
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      title: "You're on the right track",
      color: 'text-green-600 dark:text-green-500',
      bgColor: 'bg-green-500/10',
    };
  }
  if (price < 35) {
    return {
      icon: <CircleDollarSign className="h-5 w-5 text-green-500" />,
      title: 'Good price point',
      color: 'text-green-600 dark:text-green-500',
      bgColor: 'bg-green-500/10',
    };
  }
  return {
    icon: <CircleDollarSign className="h-5 w-5 text-green-500" />,
    title: 'Great profitability!',
    color: 'text-green-600 dark:text-green-500',
    bgColor: 'bg-green-500/20',
  };
}

function PricingMockupVisual() {
  const basePriceRef = useRef(DEFAULT_PRICE);
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [sliderValue, setSliderValue] = useState(100);

  const sliderToPrice = useCallback((sliderVal: number, base: number): number => {
    if (base === 0) return 0;
    const multiplier = sliderVal / 100;
    return Math.max(0, Number.parseFloat((base * multiplier).toFixed(2)));
  }, []);

  const priceToSlider = useCallback((p: number, base: number): number => {
    if (base === 0) return 100;
    const multiplier = p / base;
    return Math.max(0, Math.min(200, Math.round(multiplier * 100)));
  }, []);

  const handleSliderChange = useCallback(
    (value: number[]) => {
      const v = value[0];
      setSliderValue(v);
      const newPrice = sliderToPrice(v, basePriceRef.current);
      setPrice(newPrice);
    },
    [sliderToPrice]
  );

  const handleAdjust = useCallback(
    (direction: 'increase' | 'decrease') => {
      const factor = ADJUST_PERCENT / 100;
      const multiplier = direction === 'increase' ? 1 + factor : 1 - factor;
      const adjusted = Math.max(
        0,
        Number.parseFloat((price * multiplier).toFixed(2))
      );
      setPrice(adjusted);
      const newSliderVal = priceToSlider(adjusted, basePriceRef.current);
      setSliderValue(newSliderVal);
    },
    [price, priceToSlider]
  );

  const displayValue = price === 0 ? '' : price.toFixed(2);
  const feedback = getPriceFeedback(price);

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-md h-full ${feedback.bgColor}`}>
        <div className="flex flex-row items-center gap-2">
          {feedback.icon}
          <h2 className={`text-lg font-semibold ${feedback.color}`}>{feedback.title}</h2>
        </div>
      </div>
      <div className="w-full max-w-sm mx-auto bg-muted text-foreground rounded-md p-3 space-y-4">
      <Label htmlFor={MOCK_INPUT_ID}>Price</Label>
      <Slider
        value={[sliderValue]}
        onValueChange={handleSliderChange}
        min={0}
        max={200}
        step={1}
        className="w-full"
      />
      <div className="grid grid-cols-4 gap-2 mt-1 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-full text-muted-foreground"
          type="button"
          onClick={() => handleAdjust('decrease')}
        >
          <span className="text-sm">-{ADJUST_PERCENT}%</span>
        </Button>
        <div className="col-span-2 flex items-center space-x-1">
          <CurrencyInput
            id={MOCK_INPUT_ID}
            currency="GBP"
            value={displayValue}
            onChange={() => {}}
            showFree={true}
            readOnly
            className="h-10 text-base w-full"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-full text-muted-foreground"
          type="button"
          onClick={() => handleAdjust('increase')}
        >
          <span className="text-sm">+{ADJUST_PERCENT}%</span>
        </Button>
      </div>
    </div>
    </div>
  );
}

export function PricingCostsSection() {
  return (
    <HomeSection
      title="Play with pricing and costs to explore viability"
      visual={<PricingMockupVisual />}
      description={DESCRIPTION}
      variant="blue"
    />
  );
}
