'use client';

import { useState } from 'react';
import type { WishlistItem } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Trash2, Link as LinkIcon, Gift } from 'lucide-react';
import Link from 'next/link';

interface WishlistEditorProps {
  initialItems: WishlistItem[];
}

export default function WishlistEditor({ initialItems }: WishlistEditorProps) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemLink, setNewItemLink] = useState('');

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem: WishlistItem = {
      id: `wish_${Date.now()}`,
      name: newItemName,
      description: newItemDesc,
      link: newItemLink,
    };
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemLink('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Add New Item</h4>
            <Input
              placeholder="Gift Name (e.g., Coffee Mug)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <Textarea
              placeholder="Description (e.g., Large, blue, dishwasher safe)"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
            />
            <Input
              placeholder="Reference Link (optional)"
              value={newItemLink}
              onChange={(e) => setNewItemLink(e.target.value)}
            />
          </div>
          <Button onClick={handleAddItem}>Add to Wishlist</Button>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <Card key={item.id} className="flex items-center p-4">
              <div className="flex-grow">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.link && (
                  <Link href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1 mt-1">
                    <LinkIcon className="w-3 h-3" />
                    Reference Link
                  </Link>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add some items so your Manito knows what to get you!</p>
          </div>
        )}
      </div>
    </div>
  );
}
