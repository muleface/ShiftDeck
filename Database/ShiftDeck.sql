PGDMP  ;    -                }         	   ShiftDeck    17.4    17.4 %    F           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            G           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            H           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            I           1262    16388 	   ShiftDeck    DATABASE     q   CREATE DATABASE "ShiftDeck" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en-US';
    DROP DATABASE "ShiftDeck";
                     postgres    false            J           0    0    DATABASE "ShiftDeck"    COMMENT     J   COMMENT ON DATABASE "ShiftDeck" IS 'ShiftDeck project local test server';
                        postgres    false    4937            �            1259    16390    interns    TABLE     �   CREATE TABLE public.interns (
    intern_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    department character varying(255)
);
    DROP TABLE public.interns;
       public         heap r       postgres    false            �            1259    16460    intern_intern_id_seq    SEQUENCE     �   CREATE SEQUENCE public.intern_intern_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.intern_intern_id_seq;
       public               postgres    false    218            K           0    0    intern_intern_id_seq    SEQUENCE OWNED BY     N   ALTER SEQUENCE public.intern_intern_id_seq OWNED BY public.interns.intern_id;
          public               postgres    false    225            �            1259    16389    interns_intern_id_seq    SEQUENCE     �   CREATE SEQUENCE public.interns_intern_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.interns_intern_id_seq;
       public               postgres    false    218            L           0    0    interns_intern_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.interns_intern_id_seq OWNED BY public.interns.intern_id;
          public               postgres    false    217            �            1259    16414    login    TABLE     �   CREATE TABLE public.login (
    username character varying(50) NOT NULL,
    user_password character(60),
    intern_id integer,
    status integer
);
    DROP TABLE public.login;
       public         heap r       postgres    false            �            1259    16398    shifts    TABLE     �   CREATE TABLE public.shifts (
    shift_id integer NOT NULL,
    intern_id integer NOT NULL,
    shift_date date NOT NULL,
    station_num integer
);
    DROP TABLE public.shifts;
       public         heap r       postgres    false            �            1259    16397    shifts_shift_id_seq    SEQUENCE     �   CREATE SEQUENCE public.shifts_shift_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.shifts_shift_id_seq;
       public               postgres    false    220            M           0    0    shifts_shift_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.shifts_shift_id_seq OWNED BY public.shifts.shift_id;
          public               postgres    false    219            �            1259    16429    station_roles    TABLE     ~   CREATE TABLE public.station_roles (
    intern_id integer NOT NULL,
    station_num integer NOT NULL,
    role_num integer
);
 !   DROP TABLE public.station_roles;
       public         heap r       postgres    false            �            1259    16450    stations_station_num_seq    SEQUENCE     �   CREATE SEQUENCE public.stations_station_num_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.stations_station_num_seq;
       public               postgres    false            �            1259    16424    stations    TABLE     �   CREATE TABLE public.stations (
    station_num integer DEFAULT nextval('public.stations_station_num_seq'::regclass) NOT NULL,
    station_name character varying(50) NOT NULL
);
    DROP TABLE public.stations;
       public         heap r       postgres    false    224            �           2604    16461    interns intern_id    DEFAULT     u   ALTER TABLE ONLY public.interns ALTER COLUMN intern_id SET DEFAULT nextval('public.intern_intern_id_seq'::regclass);
 @   ALTER TABLE public.interns ALTER COLUMN intern_id DROP DEFAULT;
       public               postgres    false    225    218            �           2604    16462    shifts shift_id    DEFAULT     r   ALTER TABLE ONLY public.shifts ALTER COLUMN shift_id SET DEFAULT nextval('public.shifts_shift_id_seq'::regclass);
 >   ALTER TABLE public.shifts ALTER COLUMN shift_id DROP DEFAULT;
       public               postgres    false    219    220    220            <          0    16390    interns 
   TABLE DATA           O   COPY public.interns (intern_id, first_name, last_name, department) FROM stdin;
    public               postgres    false    218   �)       ?          0    16414    login 
   TABLE DATA           K   COPY public.login (username, user_password, intern_id, status) FROM stdin;
    public               postgres    false    221   �*       >          0    16398    shifts 
   TABLE DATA           N   COPY public.shifts (shift_id, intern_id, shift_date, station_num) FROM stdin;
    public               postgres    false    220   �*       A          0    16429    station_roles 
   TABLE DATA           I   COPY public.station_roles (intern_id, station_num, role_num) FROM stdin;
    public               postgres    false    223   +       @          0    16424    stations 
   TABLE DATA           =   COPY public.stations (station_num, station_name) FROM stdin;
    public               postgres    false    222   -+       N           0    0    intern_intern_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.intern_intern_id_seq', 26, true);
          public               postgres    false    225            O           0    0    interns_intern_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.interns_intern_id_seq', 31, true);
          public               postgres    false    217            P           0    0    shifts_shift_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.shifts_shift_id_seq', 2, true);
          public               postgres    false    219            Q           0    0    stations_station_num_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.stations_station_num_seq', 5, true);
          public               postgres    false    224            �           2606    16395    interns intern_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.interns
    ADD CONSTRAINT intern_pkey PRIMARY KEY (intern_id);
 =   ALTER TABLE ONLY public.interns DROP CONSTRAINT intern_pkey;
       public                 postgres    false    218            �           2606    16433 !   station_roles intern_station_perm 
   CONSTRAINT     s   ALTER TABLE ONLY public.station_roles
    ADD CONSTRAINT intern_station_perm PRIMARY KEY (intern_id, station_num);
 K   ALTER TABLE ONLY public.station_roles DROP CONSTRAINT intern_station_perm;
       public                 postgres    false    223    223            �           2606    16418    login login_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_pkey PRIMARY KEY (username);
 :   ALTER TABLE ONLY public.login DROP CONSTRAINT login_pkey;
       public                 postgres    false    221            �           2606    16403    shifts shifts_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (shift_id);
 <   ALTER TABLE ONLY public.shifts DROP CONSTRAINT shifts_pkey;
       public                 postgres    false    220            �           2606    16454    stations stations_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_pkey PRIMARY KEY (station_num);
 @   ALTER TABLE ONLY public.stations DROP CONSTRAINT stations_pkey;
       public                 postgres    false    222            �           2606    16419    login login_intern_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(intern_id);
 D   ALTER TABLE ONLY public.login DROP CONSTRAINT login_intern_id_fkey;
       public               postgres    false    221    218    4765            �           2606    16439    shifts shifts_intern_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(intern_id);
 F   ALTER TABLE ONLY public.shifts DROP CONSTRAINT shifts_intern_id_fkey;
       public               postgres    false    4765    218    220            �           2606    16455    shifts shifts_station_num_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_station_num_fkey FOREIGN KEY (station_num) REFERENCES public.stations(station_num);
 H   ALTER TABLE ONLY public.shifts DROP CONSTRAINT shifts_station_num_fkey;
       public               postgres    false    4771    220    222            �           2606    16434 0   station_roles station_permissions_intern_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.station_roles
    ADD CONSTRAINT station_permissions_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(intern_id);
 Z   ALTER TABLE ONLY public.station_roles DROP CONSTRAINT station_permissions_intern_id_fkey;
       public               postgres    false    4765    218    223            <     x�e�AK1�ϻ?F�h�U�Z(�/��`�d75�.��2o=/��7c�s"�!'ϥ9�S��={���k-�u�QJ�אx
���J�~����y��KEVYK긌����9���#Q�����E�bֽ�UN(E=�A{ǋ�Qݖ����������/�k���wa�7cPݞh���ud�n�{�a䂷�����hQ�C/�4���(�]��h��/SZ�����v9[A~��qԸ�Y����m�o�$ 2      ?      x������ � �      >       x�3�4��4202�50�54������� 3W      A      x������ � �      @   L   x�3�tI-H,*�M�+�2�t�M-JO�K�T���Up�2Fr�2�)J,�MTp�I-�2��K��K,I������ `��     