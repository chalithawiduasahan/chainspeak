import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Helper function to create notifications
async function createNotification(supabase: any, notification: {
  userId: string;
  type: 'sale' | 'purchase' | 'listing' | 'system';
  title: string;
  message: string;
  metadata?: any;
}) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata || {},
        is_read: false
      }]);

    if (error) {
      console.warn('Failed to create notification:', error);
    } else {
      console.log('✅ Notification created successfully');
    }
  } catch (error) {
    console.warn('Failed to create notification:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      buyerUserId,
      buyerUsername,
      listingId
    } = await req.json();

    // Validate required fields
    if (!buyerUserId || !buyerUsername || !listingId) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: buyerUserId, buyerUsername, listingId'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('💰 Processing chat purchase:', {
      buyerUserId,
      buyerUsername,
      listingId
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify buyer exists
    const { data: buyerProfile, error: buyerError } = await supabase
      .from('user_profiles')
      .select('id, nickname')
      .eq('id', buyerUserId)
      .eq('nickname', buyerUsername)
      .single();

    if (buyerError || !buyerProfile) {
      console.error('Buyer verification failed:', buyerError);
      return new Response(JSON.stringify({
        error: 'Buyer verification failed'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the listing details
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', listingId)
      .eq('is_active', true)
      .single();

    if (listingError || !listing) {
      console.error('Error fetching listing:', listingError);
      return new Response(JSON.stringify({
        error: 'Listing not found or no longer active'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if buyer is trying to buy their own chat
    if (listing.seller_user_id === buyerUserId) {
      return new Response(JSON.stringify({
        error: 'You cannot buy your own chat listing'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if buyer has already purchased this chat
    const { data: existingPurchase, error: purchaseCheckError } = await supabase
      .from('marketplace_purchases')
      .select('id, purchased_at')
      .eq('buyer_user_id', buyerUserId)
      .eq('listing_id', listingId)
      .limit(1);

    if (purchaseCheckError) {
      console.error('Error checking existing purchase:', purchaseCheckError);
      return new Response(JSON.stringify({
        error: 'Failed to check purchase history'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (existingPurchase && existingPurchase.length > 0) {
      return new Response(JSON.stringify({
        error: 'You have already purchased this chat',
        existingPurchase: existingPurchase[0]
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the encryption key for this chat session
    const { data: chatLog, error: chatError } = await supabase
      .from('chat_logs')
      .select('encryption_key')
      .eq('user_id', listing.seller_user_id)
      .eq('session_id', listing.chat_session_id)
      .limit(1)
      .single();

    if (chatError || !chatLog || !chatLog.encryption_key) {
      console.error('Error fetching chat encryption key:', chatError);
      return new Response(JSON.stringify({
        error: 'Failed to retrieve chat access credentials'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Simulate payment processing (for MVP demo)
    console.log('💳 Simulating payment processing...');
    console.log(`Processing payment of $${listing.price} for listing: ${listing.title}`);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    console.log('✅ Payment simulation completed successfully');

    // Create the purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('marketplace_purchases')
      .insert([{
        buyer_user_id: buyerUserId,
        buyer_username: buyerUsername, // Store as display text, no FK constraint
        listing_id: listingId,
        seller_user_id: listing.seller_user_id,
        seller_username: listing.seller_username, // Store as display text, no FK constraint
        chat_session_id: listing.chat_session_id,
        encryption_key: chatLog.encryption_key,
        purchase_price: listing.price
      }])
      .select()
      .single();

    if (purchaseError) {
      console.error('Error creating purchase record:', purchaseError);
      return new Response(JSON.stringify({
        error: 'Failed to complete purchase',
        details: purchaseError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create notifications for both buyer and seller
    try {
      // Notification for seller (sale)
      await createNotification(supabase, {
        userId: listing.seller_user_id,
        type: 'sale',
        title: '💰 Chat Sold!',
        message: `Your chat "${listing.title}" was purchased for $${listing.price.toFixed(2)} by ${buyerUsername}`,
        metadata: {
          chatTitle: listing.title,
          price: listing.price,
          buyerUsername: buyerUsername,
          listingId: listingId
        }
      });

      // Notification for buyer (purchase)
      await createNotification(supabase, {
        userId: buyerUserId,
        type: 'purchase',
        title: '🛒 Purchase Successful!',
        message: `You successfully purchased "${listing.title}" for $${listing.price.toFixed(2)} from ${listing.is_anonymous ? 'Anonymous' : listing.seller_username}`,
        metadata: {
          chatTitle: listing.title,
          price: listing.price,
          sellerUsername: listing.is_anonymous ? 'Anonymous' : listing.seller_username,
          listingId: listingId
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create notifications:', notificationError);
      // Don't fail the purchase if notifications fail
    }

    console.log('✅ Chat purchase completed successfully:', {
      purchaseId: purchase.id,
      chatTitle: listing.title,
      price: purchase.purchase_price,
      buyer: buyerUsername,
      seller: listing.is_anonymous ? 'Anonymous' : listing.seller_username
    });

    return new Response(JSON.stringify({
      success: true,
      purchase: purchase,
      listing: {
        title: listing.title,
        description: listing.description,
        tags: listing.tags,
        is_anonymous: listing.is_anonymous
      },
      message: 'Purchase completed successfully! You can now access this chat in your "Bought Chats" section.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process chat purchase',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});