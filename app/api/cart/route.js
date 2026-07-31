import { connectDB } from "@/app/lib/mongodb";
import Cart from "@/app/models/Cart";
import Product from "@/app/models/Product";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";

async function getOwnUserId(req) {
  const session = await getRequestUser(req);
  if (!session) return null;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (userId && userId !== session.uid) return false;
  return session.uid;
}

export async function GET(req) {
  try {
    await connectDB();
    const userId = await getOwnUserId(req);
    if (userId === false) return forbidden("You can only view your own cart");
    if (!userId) return unauthorized();

    const cart = await Cart.findOne({ userId });
    return NextResponse.json(cart || { items: [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const body = await req.json();
    const { userId, productId, serviceId = "", quantity = 1 } = body;

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }
    if (!productId) {
      return NextResponse.json({ error: "userId and productId are required." }, { status: 400 });
    }

    const product = await Product.findOne({ uniqueProductId: productId });
    if (!product || product.isActive === false) {
      return NextResponse.json({ error: "Product not found or unavailable." }, { status: 404 });
    }

    let service = null;
    if (serviceId) {
      service = (product.services || []).find((s) => String(s.serviceId) === String(serviceId));
      if (!service) {
        return NextResponse.json(
          { error: "Selected service is not available for this product." },
          { status: 400 }
        );
      }
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const key = `${productId}|${serviceId}`;
    const existing = cart.items.find((i) => `${i.productId}|${i.serviceId}` === key);

    const item = {
      storeId: product.storeId,
      storeName: body.storeName || "",
      productId,
      name: product.name,
      price: product.price,
      quantity: Math.max(1, Math.min(Number(quantity) || 1, product.quantity)),
      serviceId,
      serviceName: service ? service.name : "",
      serviceCharge: service ? service.charges : 0,
    };

    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, product.quantity);
    } else {
      cart.items.push(item);
    }

    await cart.save();
    return NextResponse.json(cart);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const body = await req.json();
    const { userId, productId, serviceId = "", quantity } = body;

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }
    if (!productId || !quantity) {
      return NextResponse.json({ error: "userId, productId, and quantity are required." }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return NextResponse.json({ error: "Cart not found." }, { status: 404 });

    const item = cart.items.find((i) => i.productId === productId && i.serviceId === serviceId);
    if (!item) return NextResponse.json({ error: "Item not in cart." }, { status: 404 });

    const product = await Product.findOne({ uniqueProductId: productId });
    const maxQty = product ? product.quantity : Infinity;
    item.quantity = Math.max(1, Math.min(Number(quantity), maxQty));

    await cart.save();
    return NextResponse.json(cart);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");
    const serviceId = searchParams.get("serviceId") || "";

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }
    if (!productId) {
      return NextResponse.json({ error: "userId and productId are required." }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return NextResponse.json({ items: [] });

    cart.items = cart.items.filter((i) => !(i.productId === productId && i.serviceId === serviceId));
    await cart.save();
    return NextResponse.json(cart);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}