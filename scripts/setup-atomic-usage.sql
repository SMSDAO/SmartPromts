-- Atomic usage check and increment with row-level locking
-- Run this SQL in your Supabase SQL editor before deploying to production.
-- This eliminates the race condition in concurrent usage tracking.

CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id UUID,
  p_tier TEXT,
  p_limit INTEGER
) RETURNS TABLE(allowed BOOLEAN, remaining INTEGER) AS $$
DECLARE
  v_count INTEGER;
  v_reset_at TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT usage_count, usage_reset_at
  INTO v_count, v_reset_at
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Reset usage if the period has expired
  IF v_now > v_reset_at THEN
    UPDATE users
    SET usage_count = 0,
        usage_reset_at = v_now + INTERVAL '30 days'
    WHERE id = p_user_id;

    v_count := 0;
  END IF;

  -- Check limit (-1 means unlimited)
  IF p_limit = -1 OR v_count < p_limit THEN
    -- Increment usage
    UPDATE users
    SET usage_count = usage_count + 1,
        updated_at = v_now
    WHERE id = p_user_id;

    RETURN QUERY SELECT
      true,
      CASE WHEN p_limit = -1 THEN -1 ELSE p_limit - v_count - 1 END;
  ELSE
    RETURN QUERY SELECT false, 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
