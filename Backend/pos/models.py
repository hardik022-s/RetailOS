from django.db import models
from inventory.models import Product

class Invoice(models.Model):
    PAYMENT_CHOICES = [
        ('UPI', 'UPI'),
        ('CASH', 'Cash'),
        ('CREDIT', 'Store Credit/Khata'),
    ]
    
    timestamp = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='CASH')
    customer_phone = models.CharField(max_length=15, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Bill #{self.id} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    price_at_sale = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Bill #{self.invoice.id})"