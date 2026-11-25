from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    # Core Details
    barcode = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    
    # Financials
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Stock & AI Tracking
    current_stock = models.IntegerField(default=0)
    reorder_threshold = models.IntegerField(default=10) # AI triggers warning below this
    shelf_life_days = models.IntegerField(null=True, blank=True) # For perishables like milk/eggs

    def __str__(self):
        return f"{self.name} - Stock: {self.current_stock}"