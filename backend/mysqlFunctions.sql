-- exponential_decay_fraction is used to model decay of a interaction strenght in time

CREATE FUNCTION get_exponential_decay_fraction (ref_date DATE, cur_date DATE, halflife INT)
	RETURNS FLOAT DETERMINISTIC
    RETURN ROUND(POW(0.5, (DATEDIFF(cur_date, ref_date)/halflife)),3);


-- this function is used to calculate approximate distance between two points

DELIMITER //
DROP FUNCTION IF EXISTS get_places_distance //
CREATE FUNCTION get_places_distance(lat1 FLOAT, lng1 FLOAT, lat2 FLOAT, lng2 FLOAT) RETURNS FLOAT DETERMINISTIC
BEGIN
	DECLARE degToRad float;
	DECLARE radToDeg float;
	DECLARE earth_radius FLOAT;
    DECLARE lat1_rad FLOAT;
    DECLARE lat2_rad FLOAT;
    DECLARE delta_lat FLOAT;
    DECLARE delta_lng FLOAT;
    DECLARE sin_half_delta_lat FLOAT;
    DECLARE sin_half_delta_lng FLOAT;
    DECLARE a FLOAT;
    DECLARE c FLOAT;
    DECLARE distance FLOAT;
	
    SELECT PI() / 180 INTO degToRad;
	SELECT 180 / PI() INTO radToDeg;
	SELECT 6371.0088 INTO earth_radius;
    
    SELECT degToRad * lat1 INTO lat1_rad;
    SELECT degToRad * lat2 INTO lat2_rad;
    
    SELECT (lat2 - lat1) * degToRad INTO delta_lat;
    SELECT (lng2 - lng1) * degToRad INTO delta_lng;
    
    SELECT SIN(delta_lat / 2) INTO sin_half_delta_lat;
    SELECT SIN(delta_lng / 2) INTO sin_half_delta_lng;

    SELECT sin_half_delta_lat * sin_half_delta_lat + COS(lat1_rad) * cos(lat2_rad) * sin_half_delta_lng * sin_half_delta_lng INTO a;
    SELECT 2 * ATAN2(SQRT(a), SQRT(1 - a)) INTO c;
    SELECT earth_radius * c INTO distance;

    RETURN distance;
END

-- trips_view - under construction

SELECT citybreaks.ID AS id, citybreaks.Place AS name, DATEDIFF(citybreaks.Date_stop, citybreaks.Date_start) + 1 AS trip_duration, 
AVG(places.latitude) AS avg_lat, 
AVG(places.longitude) AS avg_lon,
COUNT(places.id) AS number_of_places, 
ROUND(get_places_distance(52.23186393542273, 21.005969769871268, AVG(places.latitude), AVG(places.longitude)), 0) AS avg_km_from_warsaw, 
ROUND(MIN(get_places_distance(52.23186393542273, 21.005969769871268, places.latitude, places.longitude)), 0) AS min_km_from_warsaw, 
ROUND(MAX(get_places_distance(52.23186393542273, 21.005969769871268, places.latitude, places.longitude)), 0) AS max_km_from_warsaw,
CASE
    WHEN ROUND(MAX(get_places_distance(52.23186393542273, 21.005969769871268, places.latitude, places.longitude)), 1) < 300 THEN 3
    ELSE ROUND(LEAST(MAX(get_places_distance(52.23186393542273, 21.005969769871268, places.latitude, places.longitude) - 300)/200 + 3, 15), 2) 
END AS points_for_trip
FROM citybreaks
JOIN trip_place ON citybreaks.ID = trip_place.trip_id
JOIN places ON places.id = trip_place.place_id
GROUP BY citybreaks.ID
ORDER BY avg_km_from_warsaw DESC;

