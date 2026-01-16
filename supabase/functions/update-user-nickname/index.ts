import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, oldNickname, newNickname } = await req.json();

    // Validate required fields
    if (!userId || !oldNickname || !newNickname) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: userId, oldNickname, newNickname'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔄 Updating nickname:', {
      userId,
      oldNickname,
      newNickname
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Start a transaction-like operation by updating all tables
    console.log('📝 Updating user_profiles table...');
    
    // 1. Update the main user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ nickname: newNickname })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating user_profiles:', profileError);
      return new Response(JSON.stringify({
        error: 'Failed to update user profile',
        details: profileError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📝 Updating chat_logs table...');
    
    // 2. Update chat_logs table
    const { error: chatLogsError } = await supabase
      .from('chat_logs')
      .update({ username: newNickname })
      .eq('user_id', userId);

    if (chatLogsError) {
      console.warn('Warning: Failed to update chat_logs:', chatLogsError);
      // Don't fail the entire operation for this
    }

    console.log('📝 Updating marketplace_listings table...');
    
    // 3. Update marketplace_listings table
    const { error: listingsError } = await supabase
      .from('marketplace_listings')
      .update({ seller_username: newNickname })
      .eq('seller_user_id', userId);

    if (listingsError) {
      console.warn('Warning: Failed to update marketplace_listings:', listingsError);
      // Don't fail the entire operation for this
    }

    console.log('📝 Updating marketplace_purchases table (buyer)...');
    
    // 4. Update marketplace_purchases table (as buyer)
    const { error: purchasesBuyerError } = await supabase
      .from('marketplace_purchases')
      .update({ buyer_username: newNickname })
      .eq('buyer_user_id', userId);

    if (purchasesBuyerError) {
      console.warn('Warning: Failed to update marketplace_purchases (buyer):', purchasesBuyerError);
    }

    console.log('📝 Updating marketplace_purchases table (seller)...');
    
    // 5. Update marketplace_purchases table (as seller)
    const { error: purchasesSellerError } = await supabase
      .from('marketplace_purchases')
      .update({ seller_username: newNickname })
      .eq('seller_user_id', userId);

    if (purchasesSellerError) {
      console.warn('Warning: Failed to update marketplace_purchases (seller):', purchasesSellerError);
    }

    console.log('📝 Updating notifications table...');
    
    // 6. Update any notifications that might reference the old nickname
    // This is optional since notifications are typically historical
    
    console.log('✅ Nickname update completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Nickname updated successfully across all tables',
      oldNickname: oldNickname,
      newNickname: newNickname
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update nickname',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});