PGDMP  :                    }        	   ShiftDeck    17.4    17.4 $    F           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            G           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            H           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            I           1262    16440 	   ShiftDeck    DATABASE     q   CREATE DATABASE "ShiftDeck" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en-GB';
    DROP DATABASE "ShiftDeck";
                     postgres    false            �            1259    16441    interns    TABLE     �   CREATE TABLE public.interns (
    intern_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    department character varying(255)
);
    DROP TABLE public.interns;
       public         heap r       postgres    false            �            1259    16444    intern_intern_id_seq    SEQUENCE     �   CREATE SEQUENCE public.intern_intern_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.intern_intern_id_seq;
       public               postgres    false    217            J           0    0    intern_intern_id_seq    SEQUENCE OWNED BY     N   ALTER SEQUENCE public.intern_intern_id_seq OWNED BY public.interns.intern_id;
          public               postgres    false    218            �            1259    16445    interns_intern_id_seq    SEQUENCE     �   CREATE SEQUENCE public.interns_intern_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.interns_intern_id_seq;
       public               postgres    false    217            K           0    0    interns_intern_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.interns_intern_id_seq OWNED BY public.interns.intern_id;
          public               postgres    false    219            �            1259    16446    login    TABLE     �   CREATE TABLE public.login (
    username character varying(50) NOT NULL,
    user_password character(60),
    intern_id integer,
    status integer
);
    DROP TABLE public.login;
       public         heap r       postgres    false            �            1259    16449    shifts    TABLE     �   CREATE TABLE public.shifts (
    shift_id integer NOT NULL,
    intern_id integer NOT NULL,
    shift_date date NOT NULL,
    station_num integer
);
    DROP TABLE public.shifts;
       public         heap r       postgres    false            �            1259    16452    shifts_shift_id_seq    SEQUENCE     �   CREATE SEQUENCE public.shifts_shift_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.shifts_shift_id_seq;
       public               postgres    false    221            L           0    0    shifts_shift_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.shifts_shift_id_seq OWNED BY public.shifts.shift_id;
          public               postgres    false    222            �            1259    16453    station_roles    TABLE     ~   CREATE TABLE public.station_roles (
    intern_id integer NOT NULL,
    station_num integer NOT NULL,
    role_num integer
);
 !   DROP TABLE public.station_roles;
       public         heap r       postgres    false            �            1259    16456    stations_station_num_seq    SEQUENCE     �   CREATE SEQUENCE public.stations_station_num_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.stations_station_num_seq;
       public               postgres    false            �            1259    16457    stations    TABLE     �   CREATE TABLE public.stations (
    station_num integer DEFAULT nextval('public.stations_station_num_seq'::regclass) NOT NULL,
    station_name character varying(50) NOT NULL
);
    DROP TABLE public.stations;
       public         heap r       postgres    false    224            �           2604    16461    interns intern_id    DEFAULT     u   ALTER TABLE ONLY public.interns ALTER COLUMN intern_id SET DEFAULT nextval('public.intern_intern_id_seq'::regclass);
 @   ALTER TABLE public.interns ALTER COLUMN intern_id DROP DEFAULT;
       public               postgres    false    218    217            �           2604    16462    shifts shift_id    DEFAULT     r   ALTER TABLE ONLY public.shifts ALTER COLUMN shift_id SET DEFAULT nextval('public.shifts_shift_id_seq'::regclass);
 >   ALTER TABLE public.shifts ALTER COLUMN shift_id DROP DEFAULT;
       public               postgres    false    222    221            ;          0    16441    interns 
   TABLE DATA           O   COPY public.interns (intern_id, first_name, last_name, department) FROM stdin;
    public               postgres    false    217   �(       >          0    16446    login 
   TABLE DATA           K   COPY public.login (username, user_password, intern_id, status) FROM stdin;
    public               postgres    false    220   �)       ?          0    16449    shifts 
   TABLE DATA           N   COPY public.shifts (shift_id, intern_id, shift_date, station_num) FROM stdin;
    public               postgres    false    221   $*       A          0    16453    station_roles 
   TABLE DATA           I   COPY public.station_roles (intern_id, station_num, role_num) FROM stdin;
    public               postgres    false    223   p*       C          0    16457    stations 
   TABLE DATA           =   COPY public.stations (station_num, station_name) FROM stdin;
    public               postgres    false    225   �*       M           0    0    intern_intern_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.intern_intern_id_seq', 26, true);
          public               postgres    false    218            N           0    0    interns_intern_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.interns_intern_id_seq', 31, true);
          public               postgres    false    219            O           0    0    shifts_shift_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.shifts_shift_id_seq', 8, true);
          public               postgres    false    222            P           0    0    stations_station_num_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.stations_station_num_seq', 5, true);
          public               postgres    false    224            �           2606    16464    interns intern_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.interns
    ADD CONSTRAINT intern_pkey PRIMARY KEY (intern_id);
 =   ALTER TABLE ONLY public.interns DROP CONSTRAINT intern_pkey;
       public                 postgres    false    217            �           2606    16466 !   station_roles intern_station_perm 
   CONSTRAINT     s   ALTER TABLE ONLY public.station_roles
    ADD CONSTRAINT intern_station_perm PRIMARY KEY (intern_id, station_num);
 K   ALTER TABLE ONLY public.station_roles DROP CONSTRAINT intern_station_perm;
       public                 postgres    false    223    223            �           2606    16468    login login_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_pkey PRIMARY KEY (username);
 :   ALTER TABLE ONLY public.login DROP CONSTRAINT login_pkey;
       public                 postgres    false    220            �           2606    16470    shifts shifts_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (shift_id);
 <   ALTER TABLE ONLY public.shifts DROP CONSTRAINT shifts_pkey;
       public                 postgres    false    221            �           2606    16472    stations stations_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_pkey PRIMARY KEY (station_num);
 @   ALTER TABLE ONLY public.stations DROP CONSTRAINT stations_pkey;
       public                 postgres    false    225            �           2606    16473    login login_intern_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(intern_id);
 D   ALTER TABLE ONLY public.login DROP CONSTRAINT login_intern_id_fkey;
       public               postgres    false    217    4765    220            �           2606    16478    shifts shifts_intern_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(intern_id);
 F   ALTER TABLE ONLY public.shifts DROP CONSTRAINT shifts_intern_id_fkey;
       public               postgres    false    4765    221    217            �           2606    16483    shifts shifts_station_num_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_station_num_fkey FOREIGN KEY (station_num) REFERENCES public.stations(station_num);
 H   ALTER TABLE ONLY public.shifts DROP CONSTRAINT shifts_station_num_fkey;
       public               postgres    false    4773    225    221            �           2606    16488 0   station_roles station_permissions_intern_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.station_roles
    ADD CONSTRAINT station_permissions_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(intern_id);
 Z   ALTER TABLE ONLY public.station_roles DROP CONSTRAINT station_permissions_intern_id_fkey;
       public               postgres    false    217    223    4765            ;     x�e��j�0������t��V�6h��0�؍b�Xć�9@�~��!e��oK��J]=t�[��9Y�i��I���L��W�5��G�w�adt#��M#�[��3|��B�tێJ��в�`��K��Hu�x%�'�zY	x����|=k޸H��TwD����˵둸�R����cz��_ޢ�����XϮ#[4N^���CF1������
r�w�ǥ��m�²���:�6y9�J���j��{���j�I����FW�܏�#��o��M=)��b��P���J      >      x��,-�442V pYpr��qqq ��
�      ?   <   x�M˻   �v���a���о�(kq��7�UT�R0?8���-{ ���      A      x������ � �      C   L   x�3�tI-H,*�M�+�2�t�M-JO�K�T���Up�2Fr�2�)J,�MTp�I-�2��K��K,I������ `��     