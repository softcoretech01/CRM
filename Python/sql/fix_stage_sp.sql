DROP PROCEDURE IF EXISTS sp_update_opportunity_stage;

DELIMITER //
CREATE PROCEDURE sp_update_opportunity_stage(IN p_id INT, IN p_stage VARCHAR(30))
BEGIN
    DECLARE v_prob INT;
    SET v_prob = CASE p_stage
        WHEN 'Prospect' THEN 30
        WHEN 'Qualification' THEN 50
        WHEN 'Proposal' THEN 70
        WHEN 'Negotiation' THEN 85
        WHEN 'Won' THEN 100
        ELSE 0 END;
    UPDATE opportunities SET stage=p_stage, probability=v_prob WHERE id=p_id;
END //
DELIMITER ;
