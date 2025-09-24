
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, Link as LinkIcon, Search, Building, Store } from "lucide-react";
import Link from 'next/link';

const buyers = [
    { name: 'Reliance Fresh', type: 'Corporate', categories: ['Fruits', 'Vegetables'], location: 'Pan India' },
    { name: 'BigBasket', type: 'Corporate', categories: ['Fruits', 'Vegetables', 'Grains'], location: 'Metro Cities' },
    { name: 'Patanjali', type: 'Corporate', categories: ['Herbs', 'Grains', 'Processed Foods'], location: 'Pan India' },
    { name: 'More Retail', type: 'Corporate', categories: ['Vegetables', 'Grains'], location: 'Tier 1 & 2 Cities' },
    { name: 'Azadpur Mandi', type: 'Local', categories: ['Fruits', 'Vegetables'], location: 'Delhi' },
    { name: 'Vashi APMC', type: 'Local', categories: ['Fruits', 'Vegetables', 'Spices'], location: 'Mumbai' },
    { name: 'Koyambedu Market', type: 'Local', categories: ['Fruits', 'Vegetables', 'Flowers'], location: 'Chennai' },
    { name: 'Jaipur Kisan Mandi', type: 'Local', categories: ['Grains', 'Vegetables'], location: 'Jaipur' },
];

const usefulWebsites = [
    { name: 'e-NAM', url: 'https://www.enam.gov.in', description: 'National Agriculture Market, a pan-India electronic trading portal.' },
    { name: 'Kisan Suvidha', url: 'https://kisansuvidha.gov.in', description: 'An omnibus mobile app for farmers on weather, dealers, etc.' },
    { name: 'mKisan', url: 'https://mkisan.gov.in', description: 'Farmer Portal for information on agricultural activities.' },
    { name: 'AgriMarket', url: 'https://agmarknet.gov.in', description: 'Provides information on prices and arrivals of commodities in wholesale markets.' }
];

export default function OpenMarketPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    const filteredBuyers = buyers.filter(buyer => 
        buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === 'All' || buyer.categories.includes(categoryFilter)) &&
        (typeFilter === 'All' || buyer.type === typeFilter)
    );
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <Handshake className="h-12 w-12 mx-auto text-primary" />
                <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">Open Market</h1>
                <p className="mt-2 text-lg text-muted-foreground">Connect with buyers and explore useful resources.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Find Buyers</CardTitle>
                    <CardDescription>Search for corporate buyers or local markets to sell your produce.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search by buyer name..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Categories</SelectItem>
                                <SelectItem value="Fruits">Fruits</SelectItem>
                                <SelectItem value="Vegetables">Vegetables</SelectItem>
                                <SelectItem value="Grains">Grains</SelectItem>
                                <SelectItem value="Spices">Spices</SelectItem>
                                <SelectItem value="Herbs">Herbs</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Types</SelectItem>
                                <SelectItem value="Corporate">Corporate</SelectItem>
                                <SelectItem value="Local">Local Mandi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBuyers.map(buyer => (
                            <Card key={buyer.name}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            {buyer.type === 'Corporate' ? <Building className="h-6 w-6 text-primary"/> : <Store className="h-6 w-6 text-primary"/>}
                                        </div>
                                        <CardTitle className="text-xl">{buyer.name}</CardTitle>
                                    </div>
                                    <CardDescription>{buyer.location}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm font-medium">We buy:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {buyer.categories.map(cat => (
                                            <div key={cat} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{cat}</div>
                                        ))}
                                    </div>
                                    <Button className="w-full mt-2">Contact Buyer</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                     {filteredBuyers.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No buyers found matching your criteria.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Useful Websites for Farmers</CardTitle>
                    <CardDescription>A collection of official portals and resources to help you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {usefulWebsites.map(site => (
                        <div key={site.name} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-semibold">{site.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{site.description}</p>
                            </div>
                            <Button asChild variant="outline" className="mt-3 sm:mt-0">
                                <Link href={site.url} target="_blank" rel="noopener noreferrer">
                                    Visit Website
                                    <LinkIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </div>
    )
}
