from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import Invoice, InvoiceItem
from .serializers import InvoiceSerializer
from inventory.models import Product

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-timestamp')
    serializer_class = InvoiceSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        items_data = data.pop('items', [])
        
        # 1. Create the main invoice
        invoice = Invoice.objects.create(**data)
        
        # 2. Process each item in the cart
        for item in items_data:
            product = Product.objects.get(id=item['product'])
            quantity = item['quantity']
            
            # 3. DEDUCT STOCK (The most important retail step)
            product.current_stock -= quantity
            product.save()
            
            # 4. Save the line item
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                quantity=quantity,
                price_at_sale=item['price_at_sale'],
                subtotal=item['subtotal']
            )
            
        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)