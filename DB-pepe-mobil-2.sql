-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cable_specifications (
  id integer NOT NULL DEFAULT nextval('cable_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  cable_type character varying NOT NULL,
  length_m numeric,
  connectors character varying,
  version character varying,
  shielded boolean DEFAULT false,
  CONSTRAINT cable_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT cable_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.case_specifications (
  id integer NOT NULL DEFAULT nextval('case_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  motherboard_formats ARRAY,
  bays_35 integer,
  bays_25 integer,
  expansion_slots integer,
  max_gpu_length_mm integer,
  max_cooler_height_mm integer,
  psu_type character varying,
  included_fans integer,
  material character varying,
  CONSTRAINT case_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT case_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.categories (
  id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.communities (
  id integer NOT NULL DEFAULT nextval('communities_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  theme_category character varying,
  image_url text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  join_code character varying UNIQUE,
  privacy character varying DEFAULT 'private'::character varying CHECK (privacy::text = ANY (ARRAY['private'::character varying, 'public'::character varying]::text[])),
  topics jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT communities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.community_members (
  id integer NOT NULL DEFAULT nextval('community_members_id_seq'::regclass),
  community_id integer,
  user_id integer,
  role character varying DEFAULT 'member'::character varying CHECK (role::text = ANY (ARRAY['member'::character varying, 'moderator'::character varying, 'admin'::character varying]::text[])),
  joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT community_members_pkey PRIMARY KEY (id),
  CONSTRAINT community_members_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_posts (
  id integer NOT NULL DEFAULT nextval('community_posts_id_seq'::regclass),
  community_id integer,
  user_id integer,
  title character varying,
  content text,
  post_type character varying DEFAULT 'discussion'::character varying CHECK (post_type::text = ANY (ARRAY['discussion'::character varying, 'offer'::character varying, 'configuration'::character varying, 'question'::character varying]::text[])),
  pc_configuration jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT community_posts_pkey PRIMARY KEY (id),
  CONSTRAINT community_posts_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.conversation_members (
  id integer NOT NULL DEFAULT nextval('conversation_members_id_seq'::regclass),
  conversation_id integer NOT NULL,
  user_id integer NOT NULL,
  role character varying DEFAULT 'member'::character varying CHECK (role::text = ANY (ARRAY['member'::text, 'moderator'::text, 'admin'::text])),
  joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  last_read_at timestamp without time zone,
  CONSTRAINT conversation_members_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_members_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT conversation_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.conversations (
  id integer NOT NULL DEFAULT nextval('conversations_id_seq'::regclass),
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['direct'::text, 'group'::text])),
  title character varying,
  community_id integer,
  direct_key character varying UNIQUE,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);
CREATE TABLE public.cooler_specifications (
  id integer NOT NULL DEFAULT nextval('cooler_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  cooler_type character varying NOT NULL,
  compatible_sockets ARRAY,
  height_mm integer,
  rpm_range character varying,
  noise_level_db numeric,
  tdp_w integer,
  CONSTRAINT cooler_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT cooler_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.cpu_specifications (
  id integer NOT NULL DEFAULT nextval('cpu_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  socket character varying NOT NULL,
  cores integer NOT NULL,
  threads integer NOT NULL,
  base_frequency_ghz numeric NOT NULL,
  boost_frequency_ghz numeric,
  cache_l3 integer,
  tdp integer,
  integrated_graphics character varying,
  fabrication_technology_nm integer,
  CONSTRAINT cpu_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT cpu_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.favorites (
  id integer NOT NULL DEFAULT nextval('favorites_id_seq'::regclass),
  user_id integer,
  product_id integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.gpu_specifications (
  id integer NOT NULL DEFAULT nextval('gpu_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  vram_gb integer NOT NULL,
  vram_type character varying,
  cuda_cores integer,
  base_frequency_mhz integer,
  boost_frequency_mhz integer,
  bandwidth_gbs numeric,
  power_connectors character varying,
  length_mm integer,
  video_outputs jsonb,
  CONSTRAINT gpu_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT gpu_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.laptop_specifications (
  id integer NOT NULL DEFAULT nextval('laptop_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  processor character varying,
  ram_gb integer,
  storage character varying,
  screen_inches numeric,
  resolution character varying,
  graphics_card character varying,
  weight_kg numeric,
  battery_wh integer,
  operating_system character varying,
  CONSTRAINT laptop_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT laptop_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.messages (
  id integer NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  conversation_id integer NOT NULL,
  user_id integer NOT NULL,
  content text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp without time zone,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.monitor_specifications (
  id integer NOT NULL DEFAULT nextval('monitor_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  screen_inches numeric,
  resolution character varying,
  refresh_rate_hz integer,
  panel_type character varying,
  response_time_ms integer,
  connectors jsonb,
  curved boolean DEFAULT false,
  CONSTRAINT monitor_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT monitor_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.motherboard_specifications (
  id integer NOT NULL DEFAULT nextval('motherboard_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  socket character varying NOT NULL,
  chipset character varying NOT NULL,
  form_factor character varying NOT NULL,
  ram_slots integer NOT NULL,
  ram_type character varying,
  m2_ports integer,
  sata_ports integer,
  usb_ports jsonb,
  audio character varying,
  network character varying,
  CONSTRAINT motherboard_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT motherboard_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.other_specifications (
  id integer NOT NULL DEFAULT nextval('other_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  general_specifications jsonb,
  CONSTRAINT other_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT other_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.peripheral_specifications (
  id integer NOT NULL DEFAULT nextval('peripheral_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  peripheral_type character varying NOT NULL,
  connectivity character varying,
  mouse_sensor character varying,
  keyboard_switches character varying,
  response_frequency_hz integer,
  noise_cancellation boolean,
  microphone_type character varying,
  CONSTRAINT peripheral_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT peripheral_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.phone_specifications (
  id integer NOT NULL DEFAULT nextval('phone_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  screen_inches numeric,
  resolution character varying,
  processor character varying,
  ram_gb integer,
  storage_gb integer,
  main_camera_mp character varying,
  battery_mah integer,
  operating_system character varying,
  CONSTRAINT phone_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT phone_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  category_id integer,
  price numeric NOT NULL,
  stock integer DEFAULT 0,
  main_image text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  user_id integer,
  additional_images jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.psu_specifications (
  id integer NOT NULL DEFAULT nextval('psu_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  power_w integer NOT NULL,
  efficiency_certification character varying,
  modular_type character varying,
  form_factor character varying,
  connectors jsonb,
  fan_size_mm integer,
  active_pfc boolean,
  CONSTRAINT psu_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT psu_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.ram_specifications (
  id integer NOT NULL DEFAULT nextval('ram_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  capacity_gb integer NOT NULL,
  type character varying NOT NULL,
  speed_mhz integer NOT NULL,
  latency character varying,
  modules integer DEFAULT 2,
  voltage numeric,
  heat_spreader boolean DEFAULT false,
  rgb_lighting boolean DEFAULT false,
  CONSTRAINT ram_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT ram_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.reviews (
  id integer NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
  user_id integer,
  product_id integer,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment_text text,
  content json,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.storage_specifications (
  id integer NOT NULL DEFAULT nextval('storage_specifications_id_seq'::regclass),
  product_id integer UNIQUE,
  type character varying NOT NULL,
  capacity_gb integer NOT NULL,
  interface character varying,
  read_speed_mbs integer,
  write_speed_mbs integer,
  form_factor character varying,
  nand_type character varying,
  tbw integer,
  CONSTRAINT storage_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT storage_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.users (
  id integer NOT NULL CHECK (id > 0 AND id <= '9999999999'::bigint),
  email character varying NOT NULL UNIQUE,
  first_name character varying NOT NULL,
  last_name character varying,
  phone character varying,
  birth_date date,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_select_member ON public.conversations;
DROP POLICY IF EXISTS conversations_insert_any_authenticated ON public.conversations;
DROP POLICY IF EXISTS conversations_update_member ON public.conversations;
DROP POLICY IF EXISTS conversations_delete_member ON public.conversations;
DROP POLICY IF EXISTS conversations_select_for_members ON public.conversations;
DROP POLICY IF EXISTS conversations_select_group ON public.conversations;
DROP POLICY IF EXISTS conversations_select_if_member ON public.conversations;

CREATE POLICY conversations_select_member
ON public.conversations FOR SELECT TO authenticated
USING (
  (
    public.conversations.type = 'group'
    AND EXISTS (
      SELECT 1
      FROM public.community_members cmm
      WHERE cmm.community_id = public.conversations.community_id
        AND cmm.user_id = (
          SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
        )
    )
  )
  OR (
    public.conversations.type = 'direct'
    AND (
      public.conversations.direct_key LIKE (
        (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text || ':%'
      )
      OR public.conversations.direct_key LIKE (
        '%:' || (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text
      )
    )
  )
);

CREATE POLICY conversations_insert_any_authenticated
ON public.conversations FOR INSERT TO authenticated
WITH CHECK ( true );

CREATE POLICY conversations_update_member
ON public.conversations FOR UPDATE TO authenticated
USING (
  public.conversations.type = 'group'
  AND EXISTS (
    SELECT 1
    FROM public.community_members cmm
    WHERE cmm.community_id = public.conversations.community_id
      AND cmm.user_id = (
        SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
      )
  )
)
WITH CHECK (
  public.conversations.type = 'group'
  AND EXISTS (
    SELECT 1
    FROM public.community_members cmm
    WHERE cmm.community_id = public.conversations.community_id
      AND cmm.user_id = (
        SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
      )
  )
);

CREATE POLICY conversations_delete_member
ON public.conversations FOR DELETE TO authenticated
USING (
  public.conversations.type = 'group'
  AND EXISTS (
    SELECT 1
    FROM public.community_members cmm
    WHERE cmm.community_id = public.conversations.community_id
      AND cmm.user_id = (
        SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
      )
  )
);

DROP POLICY IF EXISTS conversation_members_select_self ON public.conversation_members;
DROP POLICY IF EXISTS conversation_members_insert_any_authenticated ON public.conversation_members;
DROP POLICY IF EXISTS conversation_members_update_self ON public.conversation_members;
DROP POLICY IF EXISTS conversation_members_delete_self ON public.conversation_members;

CREATE POLICY conversation_members_select_self
ON public.conversation_members FOR SELECT TO authenticated
USING (
  public.conversation_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY conversation_members_insert_any_authenticated
ON public.conversation_members FOR INSERT TO authenticated
WITH CHECK (
  public.conversation_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
  OR EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = public.conversation_members.conversation_id
      AND c.type = 'direct'
      AND (
        c.direct_key LIKE (
          (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text || ':%'
        )
        OR c.direct_key LIKE (
          '%:' || (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text
        )
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.community_members cmm ON cmm.community_id = c.community_id
    WHERE c.id = public.conversation_members.conversation_id
      AND c.type = 'group'
      AND cmm.user_id = (
        SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
      )
  )
);

CREATE POLICY conversation_members_update_self
ON public.conversation_members FOR UPDATE TO authenticated
USING (
  public.conversation_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  public.conversation_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY conversation_members_delete_self
ON public.conversation_members FOR DELETE TO authenticated
USING (
  public.conversation_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
);

DROP POLICY IF EXISTS messages_select_member ON public.messages;
DROP POLICY IF EXISTS messages_insert_author_member ON public.messages;
DROP POLICY IF EXISTS messages_update_author_member ON public.messages;
DROP POLICY IF EXISTS messages_delete_member ON public.messages;

CREATE POLICY messages_select_member
ON public.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_members cm
    WHERE cm.conversation_id = public.messages.conversation_id
      AND cm.user_id = (
        SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
      )
  )
  OR (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.community_members cmm ON cmm.community_id = c.community_id
      WHERE c.id = public.messages.conversation_id
        AND c.type = 'group'
        AND cmm.user_id = (
          SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
        )
    )
  )
  OR (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = public.messages.conversation_id
        AND c.type = 'direct'
        AND (
          c.direct_key LIKE (
            (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text || ':%'
          )
          OR c.direct_key LIKE (
            '%:' || (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text
          )
        )
    )
  )
);

CREATE POLICY messages_insert_author_member
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  public.messages.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
  AND (
    EXISTS (
      SELECT 1
      FROM public.conversation_members cm
      WHERE cm.conversation_id = public.messages.conversation_id
        AND cm.user_id = public.messages.user_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = public.messages.conversation_id
        AND c.type = 'direct'
        AND (
          c.direct_key LIKE (
            (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text || ':%'
          )
          OR c.direct_key LIKE (
            '%:' || (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text
          )
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.community_members cmm ON cmm.community_id = c.community_id
      WHERE c.id = public.messages.conversation_id
        AND c.type = 'group'
        AND cmm.user_id = public.messages.user_id
    )
  )
);

CREATE POLICY messages_update_author_member
ON public.messages FOR UPDATE TO authenticated
USING (
  public.messages.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
  AND (
    EXISTS (
      SELECT 1
      FROM public.conversation_members cm
      WHERE cm.conversation_id = public.messages.conversation_id
        AND cm.user_id = (
          SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.community_members cmm ON cmm.community_id = c.community_id
      WHERE c.id = public.messages.conversation_id
        AND c.type = 'group'
        AND cmm.user_id = (
          SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = public.messages.conversation_id
        AND c.type = 'direct'
        AND (
          c.direct_key LIKE (
            (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text || ':%'
          )
          OR c.direct_key LIKE (
            '%:' || (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text
          )
        )
    )
  )
)
WITH CHECK (
  public.messages.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY messages_delete_member
ON public.messages FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_members cm
    WHERE cm.conversation_id = public.messages.conversation_id
      AND cm.user_id = (
        SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.community_members cmm ON cmm.community_id = c.community_id
    WHERE c.id = public.messages.conversation_id
      AND c.type = 'group'
      AND cmm.user_id = (
        SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = public.messages.conversation_id
      AND c.type = 'direct'
      AND (
        c.direct_key LIKE (
          (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text || ':%'
        )
        OR c.direct_key LIKE (
          '%:' || (SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email')::text
        )
      )
  )
);

DROP POLICY IF EXISTS users_select_authenticated ON public.users;
CREATE POLICY users_select_authenticated
ON public.users FOR SELECT TO authenticated
USING ( true );

DROP POLICY IF EXISTS communities_select_authenticated ON public.communities;
CREATE POLICY communities_select_authenticated
ON public.communities FOR SELECT TO authenticated
USING ( true );

DROP POLICY IF EXISTS communities_insert_any_authenticated ON public.communities;
CREATE POLICY communities_insert_any_authenticated
ON public.communities FOR INSERT TO authenticated
WITH CHECK ( true );

DROP POLICY IF EXISTS community_members_select_self ON public.community_members;
DROP POLICY IF EXISTS community_members_insert_any_authenticated ON public.community_members;
DROP POLICY IF EXISTS community_members_update_self ON public.community_members;
DROP POLICY IF EXISTS community_members_delete_self ON public.community_members;

CREATE POLICY community_members_select_self
ON public.community_members FOR SELECT TO authenticated
USING (
  public.community_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY community_members_insert_any_authenticated
ON public.community_members FOR INSERT TO authenticated
WITH CHECK ( true );

CREATE POLICY community_members_update_self
ON public.community_members FOR UPDATE TO authenticated
USING (
  public.community_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  public.community_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY community_members_delete_self
ON public.community_members FOR DELETE TO authenticated
USING (
  public.community_members.user_id = (
    SELECT u.id FROM public.users u WHERE u.email = auth.jwt() ->> 'email'
  )
);