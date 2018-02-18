create table corrections
(
old varchar(500)
, new varchar(500)
)

insert into corrections(old,new)
values
("Stn.", "Station")
,("stn.", "Station")
,("Govt.", "Government")
/*,("St.", "Saint")*/
,("Jn.", "Junction")
,("Jn", "Junction")
,("K'tak", "Karnataka")
,("WT", "Water Treatment")
,("H.S.", "High School")
,("BUSSTAND", "Bus Stand")

;