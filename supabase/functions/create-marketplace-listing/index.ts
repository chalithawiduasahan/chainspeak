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
      sellerUserId,
      sellerUsername,
      chatSessionId,
      title,
      description,
      price,
      tags,
      isAnonymous
    } = await req.json();

    // Validate required fields
    if (!sellerUserId || !sellerUsername || !chatSessionId || !title || price === undefined) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: sellerUserId, sellerUsername, chatSessionId, title, price'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🏪 Creating marketplace listing:', {
      sellerUserId,
      sellerUsername,
      chatSessionId,
      title,
      price,
      isAnonymous
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user exists and owns this chat session
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('id, nickname')
      .eq('id', sellerUserId)
      .eq('nickname', sellerUsername)
      .single();

    if (userError || !userProfile) {
      console.error('User verification failed:', userError);
      return new Response(JSON.stringify({
        error: 'User verification failed'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user owns this chat session
    const { data: chatLogs, error: chatError } = await supabase
      .from('chat_logs')
      .select('user_id, session_id, encryption_key')
      .eq('user_id', sellerUserId)
      .eq('session_id', chatSessionId)
      .limit(1);

    if (chatError) {
      console.error('Error checking chat ownership:', chatError);
      return new Response(JSON.stringify({
        error: 'Failed to verify chat ownership'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!chatLogs || chatLogs.length === 0) {
      return new Response(JSON.stringify({
        error: 'Chat session not found or you do not own this chat'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if this chat is already listed by this user (active listings only)
    const { data: existingListing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('id, title')
      .eq('seller_user_id', sellerUserId)
      .eq('chat_session_id', chatSessionId)
      .eq('is_active', true)
      .limit(1);

    if (listingError) {
      console.error('Error checking existing listing:', listingError);
      return new Response(JSON.stringify({
        error: 'Failed to check existing listings'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (existingListing && existingListing.length > 0) {
      return new Response(JSON.stringify({
        error: 'This chat is already listed for sale',
        existingListing: existingListing[0]
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate and sanitize inputs
    const sanitizedPrice = Math.max(0, parseFloat(price) || 0);
    const sanitizedTags = Array.isArray(tags) ? tags.filter(tag => 
      typeof tag === 'string' && tag.trim().length > 0
    ).map(tag => tag.trim().toLowerCase()) : [];
    
    // Create the marketplace listing
    const { data: listing, error: insertError } = await supabase
      .from('marketplace_listings')
      .insert([{
        seller_user_id: sellerUserId,
        seller_username: sellerUsername, // Store as display text, no FK constraint
        chat_session_id: chatSessionId,
        title: title.trim(),
        description: (description || '').trim(),
        price: sanitizedPrice,
        tags: sanitizedTags,
        is_anonymous: Boolean(isAnonymous),
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating listing:', insertError);
      return new Response(JSON.stringify({
        error: 'Failed to create marketplace listing',
        details: insertError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create listing notification
    try {
      await createNotification(supabase, {
        userId: sellerUserId,
        type: 'listing',
        title: '📝 Chat Listed!',
        message: `Your chat "${title}" is now listed for ${sanitizedPrice === 0 ? 'free' : `$${sanitizedPrice.toFixed(2)}`}`,
        metadata: {
          chatTitle: title,
          price: sanitizedPrice,
          listingId: listing.id
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create listing notification:', notificationError);
      // Don't fail the listing creation if notification fails
    }

    console.log('✅ Marketplace listing created successfully:', {
      listingId: listing.id,
      title: listing.title,
      price: listing.price,
      isAnonymous: listing.is_anonymous
    });

    return new Response(JSON.stringify({
      success: true,
      listing: listing,
      message: 'Chat listing created successfully!'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create marketplace listing',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});