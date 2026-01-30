import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    ShoppingCart,
    Pill,
    Package,
    Truck,
    Star,
    Plus
} from 'lucide-react';

const MedicinesView = () => {
    // Mock medicine data
    const medicines = [
        {
            id: '1',
            name: 'Dolo-650',
            genericName: 'Paracetamol',
            price: 25.50,
            rating: 4.5,
            inStock: true,
            prescription: false,
            image: '/placeholder.svg'
        },
        {
            id: '2',
            name: 'Augmentin-625',
            genericName: 'Amoxicillin + Clavulanic Acid',
            price: 180.00,
            rating: 4.2,
            inStock: true,
            prescription: true,
            image: '/placeholder.svg'
        },
        {
            id: '3',
            name: 'Cetirizine 10mg',
            genericName: 'Cetirizine Hydrochloride',
            price: 45.00,
            rating: 4.7,
            inStock: false,
            prescription: false,
            image: '/placeholder.svg'
        }
    ];

    const orders = [
        {
            id: 'ORD-001',
            date: '2025-01-28',
            status: 'delivered',
            items: 2,
            total: 205.50
        },
        {
            id: 'ORD-002',
            date: '2025-01-25',
            status: 'in_transit',
            items: 1,
            total: 25.50
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2">Medicines Marketplace</h1>
                <p className="text-muted-foreground">
                    Order medicines safely with prescription verification and home delivery.
                </p>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search medicines by name or generic name..."
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quick Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                        <Pill className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-medium">Pain Relief</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                        <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="font-medium">Antibiotics</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                        <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="font-medium">Vitamins</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                        <Plus className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <p className="font-medium">First Aid</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Medicines */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                Available Medicines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {medicines.map((medicine) => (
                                    <div key={medicine.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Pill className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{medicine.name}</h4>
                                            <p className="text-sm text-muted-foreground">{medicine.genericName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs">{medicine.rating}</span>
                                                </div>
                                                {medicine.prescription && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Prescription Required
                                                    </Badge>
                                                )}
                                                {!medicine.inStock && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Out of Stock
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">₹{medicine.price}</p>
                                            <Button
                                                size="sm"
                                                disabled={!medicine.inStock}
                                                className="mt-2"
                                            >
                                                <ShoppingCart className="h-3 w-3 mr-1" />
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order History */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Recent Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="p-3 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium text-sm">{order.id}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(order.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm">{order.items} items</p>
                                            <p className="font-semibold">₹{order.total}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cart Summary */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Cart Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                                <Button>Start Shopping</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MedicinesView;