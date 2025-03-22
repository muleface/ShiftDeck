--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-03-18 23:09:23

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16390)
-- Name: interns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interns (
    intern_id integer NOT NULL,
    name character varying(50) NOT NULL,
    hospital character varying(50) DEFAULT 'Wolfson'::character varying NOT NULL
);


ALTER TABLE public.interns OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16389)
-- Name: intern_intern_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.intern_intern_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.intern_intern_id_seq OWNER TO postgres;

--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 217
-- Name: intern_intern_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.intern_intern_id_seq OWNED BY public.interns.intern_id;


--
-- TOC entry 220 (class 1259 OID 16398)
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    shift_id integer NOT NULL,
    intern integer NOT NULL,
    shift_date date NOT NULL,
    department character varying(50) NOT NULL
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16397)
-- Name: shifts_shift_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shifts_shift_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shifts_shift_id_seq OWNER TO postgres;

--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 219
-- Name: shifts_shift_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shifts_shift_id_seq OWNED BY public.shifts.shift_id;


--
-- TOC entry 4747 (class 2604 OID 16393)
-- Name: interns intern_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interns ALTER COLUMN intern_id SET DEFAULT nextval('public.intern_intern_id_seq'::regclass);


--
-- TOC entry 4749 (class 2604 OID 16401)
-- Name: shifts shift_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts ALTER COLUMN shift_id SET DEFAULT nextval('public.shifts_shift_id_seq'::regclass);


--
-- TOC entry 4901 (class 0 OID 16390)
-- Dependencies: 218
-- Data for Name: interns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interns (intern_id, name, hospital) FROM stdin WITH (FORMAT text);;
1	Sokolov	Wolfson
2	Habiballa	Wolfson
3	Chush	Wolfson
4	Rava	Wolfson
5	Bodinovsky	Wolfson
6	Gilbert	Wolfson
7	Cohen	Wolfson
8	Yaakov	Wolfson
9	Iraqi	Wolfson
10	Rasheks	Wolfson
11	Zahalka	Wolfson
12	Yucha	Wolfson
13	Leibo	Wolfson
14	Ziv	Wolfson
15	Mimrod	Wolfson
16	Rachnich	Wolfson
17	Peleg	Wolfson
18	Epstein	Wolfson
19	Vinterov	Wolfson
20	Peled	Wolfson
21	Amiel	Wolfson
22	Bordechsky	Wolfson
23	Shemrech	Wolfson
24	Maman	Wolfson
25	Lerner	Wolfson
26	Lahad	Wolfson
\.


--
-- TOC entry 4903 (class 0 OID 16398)
-- Dependencies: 220
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shifts (shift_id, intern, shift_date, department) FROM stdin;
2	18	2025-03-17	string
\.


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 217
-- Name: intern_intern_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.intern_intern_id_seq', 26, true);


--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 219
-- Name: shifts_shift_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shifts_shift_id_seq', 2, true);


--
-- TOC entry 4751 (class 2606 OID 16395)
-- Name: interns intern_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT intern_pkey PRIMARY KEY (intern_id);


--
-- TOC entry 4753 (class 2606 OID 16403)
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (shift_id);


--
-- TOC entry 4754 (class 2606 OID 16404)
-- Name: shifts shifts_intern_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_intern_fkey FOREIGN KEY (intern) REFERENCES public.interns(intern_id);


-- Completed on 2025-03-18 23:09:23

--
-- PostgreSQL database dump complete
--

