-- Allow message recipients to update message status (read receipts)

-- RLS: recipients can update messages in their conversations (used for status updates)
CREATE POLICY "Recipients can update message status"
ON public.messages
FOR UPDATE
USING (
  auth.uid() <> sender_id
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

-- Guardrail: if updater isn't the sender, only allow changing the status field
CREATE OR REPLACE FUNCTION public.enforce_message_recipient_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> OLD.sender_id THEN
    IF NEW.conversation_id <> OLD.conversation_id
      OR NEW.sender_id <> OLD.sender_id
      OR NEW.content <> OLD.content
      OR COALESCE(NEW.media_url,'') <> COALESCE(OLD.media_url,'')
      OR COALESCE(NEW.media_type,'') <> COALESCE(OLD.media_type,'')
    THEN
      RAISE EXCEPTION 'Only message status can be updated by the recipient';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status NOT IN ('sent','delivered','read') THEN
      RAISE EXCEPTION 'Invalid message status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_message_recipient_updates ON public.messages;
CREATE TRIGGER trg_enforce_message_recipient_updates
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.enforce_message_recipient_updates();
